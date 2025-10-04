from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image
import io
import base64
import os
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Unified prompt template that handles both human safety and crop analysis
UNIFIED_PROMPT = """
PRIORITY: SAFETY CHECK FIRST.

1.  **Human Detection:**
    *   Analyze the image for the presence of any person exhibiting the following conditions: lying down, on the ground, appearing injured, or unconscious. Look for any indication of a human body.
    *   If a human is detected under *any* of these conditions, respond *immediately and exclusively* with: `⚠️ SAFETY ALERT: Person detected in field. Immediate attention required.` Cease all further analysis.

2.  **Crop Analysis (Only if no human is detected):**
    *   Identify the type of plant in the image.
    *   Identify any diseases affecting the plant.
    *   Describe the visible symptoms of the disease (e.g., spots, wilting, discoloration).
    *   Recommend appropriate treatments for the identified disease.
    *   Suggest preventative measures to avoid future occurrences.

"""


class VLMInference:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        try:
            # Load the merged model
            logger.info(f"Loading model from: {model_path}")
            self.model = AutoModelForVision2Seq.from_pretrained(
                model_path,
                device_map="auto" if torch.cuda.is_available() else None,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            self.processor = AutoProcessor.from_pretrained(model_path)
            logger.info("Model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise e
    
    def generate_response(self, image, prompt, max_new_tokens=500, temperature=0.5):
        """
        Generate response with the unified prompt
        
        Args:
            image: PIL Image object
            prompt: Text prompt for analysis
            max_new_tokens: Maximum number of new tokens to generate
            temperature: Sampling temperature
        """
        try:
            # Method 1: Try with conversation format (recommended for SmolVLM)
            try:
                conversation = [
                    {
                        "role": "user",
                        "content": [
                            {"type": "image"},
                            {"type": "text", "text": prompt}
                        ]
                    }
                ]
                
                # Apply chat template
                prompt_text = self.processor.apply_chat_template(
                    conversation, 
                    add_generation_prompt=True,
                    tokenize=False
                )
                
                # Prepare the input with properly formatted text
                inputs = self.processor(
                    text=prompt_text,
                    images=[image],
                    return_tensors="pt"
                )
                
            except Exception as e:
                logger.warning(f"Chat template failed, trying simple format: {e}")
                
                # Method 2: Fallback to simple format
                inputs = self.processor(
                    text=f"<image>\nUser: {prompt}\nAssistant:",
                    images=[image],
                    return_tensors="pt"
                )
            
            # Move to device
            if torch.cuda.is_available():
                inputs = {k: v.to(self.device) if isinstance(v, torch.Tensor) else v 
                         for k, v in inputs.items()}
            
            # Generate response
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=True,
                    temperature=temperature,
                    top_p=0.9,
                    top_k=50,
                    pad_token_id=self.processor.tokenizer.pad_token_id,
                    eos_token_id=self.processor.tokenizer.eos_token_id,
                    use_cache=True,
                    repetition_penalty=1.1
                )
            
            # Extract only the new tokens (response)
            generated_ids = generated_ids[:, inputs["input_ids"].shape[1]:]
            
            # Decode the response
            response = self.processor.decode(generated_ids[0], skip_special_tokens=True)
            
            # Clean up the response
            response = response.strip()
            if response.startswith("Assistant:"):
                response = response[10:].strip()
            
            # Additional cleanup
            response = self.clean_response(response)
            
            return response if response else "Unable to generate analysis for this image."
            
        except Exception as e:
            logger.error(f"Error during inference: {e}")
            return f"Error processing image: {str(e)[:100]}..."
    
    def clean_response(self, response):
        """Clean and format the model response"""
        # Remove common artifacts
        response = response.replace("<|im_end|>", "").replace("<|im_start|>", "")
        response = response.replace("</s>", "").replace("<s>", "")
        
        # Remove repetitive patterns
        lines = response.split('\n')
        cleaned_lines = []
        prev_line = ""
        
        for line in lines:
            line = line.strip()
            if line and line != prev_line:
                cleaned_lines.append(line)
                prev_line = line
        
        return '\n'.join(cleaned_lines)

# Initialize the model
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "el shyh fel shyh" / "merged-model"

# Check if model exists
if not MODEL_PATH.exists():
    logger.error(f"Model not found at {MODEL_PATH}")
    logger.info("Please make sure you've exported your trained model first!")
    vlm_model = None
else:
    try:
        vlm_model = VLMInference(str(MODEL_PATH))
    except Exception as e:
        logger.error(f"Failed to initialize model: {e}")
        vlm_model = None


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_unified_prompt', methods=['GET'])
def get_unified_prompt():
    """Endpoint to get the unified prompt"""
    return jsonify({
        "prompt": UNIFIED_PROMPT,
        "success": True
    })

@app.route('/test', methods=['GET'])
def test_model():
    """Test endpoint to verify model functionality"""
    if vlm_model is None:
        return jsonify({
            "error": "Model not loaded",
            "success": False
        }), 500
    
    try:
        from PIL import Image
        import numpy as np
        
        test_image = Image.fromarray(
            np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        )
        
        response = vlm_model.generate_response(
            test_image, 
            "What do you see?", 
            max_new_tokens=100,
            temperature=0.3
        )
        
        return jsonify({
            "test_response": response,
            "success": True,
            "message": "Model is working correctly"
        })
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        return jsonify({
            "error": f"Test failed: {str(e)}",
            "success": False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = "healthy" if vlm_model is not None else "model_not_loaded"
    return jsonify({
        "status": status,
        "model_path": str(MODEL_PATH),
        "device": str(torch.device("cuda" if torch.cuda.is_available() else "cpu")),
        "cuda_available": torch.cuda.is_available()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint using unified prompt"""
    if vlm_model is None:
        return jsonify({
            "error": "Model not loaded. Please check server logs.",
            "success": False
        }), 500
    
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({
                "error": "No image file provided",
                "success": False
            }), 400
        
        image_file = request.files['image']
        
        # Get parameters
        max_tokens = int(request.form.get('max_tokens', 500))
        temperature = float(request.form.get('temperature', 0.5))
        
        # Validate parameters
        max_tokens = max(100, min(max_tokens, 1000))
        temperature = max(0.1, min(temperature, 1.0))
        
        # Validate image
        if image_file.filename == '':
            return jsonify({
                "error": "No image file selected",
                "success": False
            }), 400
        
        # Load and process image
        image = Image.open(image_file.stream).convert('RGB')
        
        # Generate response using unified prompt
        response = vlm_model.generate_response(
            image, 
            UNIFIED_PROMPT, 
            max_new_tokens=max_tokens,
            temperature=temperature
        )
        
        # Check if it's a safety alert
        is_safety_alert = "SAFETY ALERT" in response
        
        return jsonify({
            "response": response,
            "is_safety_alert": is_safety_alert,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        return jsonify({
            "error": f"Server error: {str(e)}",
            "success": False
        }), 500

@app.route('/predict_base64', methods=['POST'])
def predict_base64():
    """Prediction endpoint that accepts base64 encoded images"""
    if vlm_model is None:
        return jsonify({
            "error": "Model not loaded. Please check server logs.",
            "success": False
        }), 500
    
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({
                "error": "No image data provided",
                "success": False
            }), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',', 1)[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Get parameters
        max_tokens = int(data.get('max_tokens', 500))
        temperature = float(data.get('temperature', 0.5))
        
        # Validate parameters
        max_tokens = max(100, min(max_tokens, 1000))
        temperature = max(0.1, min(temperature, 1.0))
        
        # Generate response
        response = vlm_model.generate_response(
            image, 
            UNIFIED_PROMPT, 
            max_new_tokens=max_tokens,
            temperature=temperature
        )
        
        # Check if it's a safety alert
        is_safety_alert = "SAFETY ALERT" in response
        
        return jsonify({
            "response": response,
            "is_safety_alert": is_safety_alert,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in predict_base64 endpoint: {e}")
        return jsonify({
            "error": f"Server error: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    print("🚀 Starting VLM Server...")
    print(f"📁 Model path: {MODEL_PATH}")
    print(f"🔧 Model loaded: {'✅' if vlm_model else '❌'}")
    print("🌐 Server will be available at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)