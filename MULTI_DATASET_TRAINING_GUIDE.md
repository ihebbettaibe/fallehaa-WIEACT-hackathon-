# Multi-Dataset YOLO Fine-Tuning Guide

Train YOLO on multiple datasets: **Plant Anomaly Detection** + **Fall Detection**

## 📋 What You Have

1. **Plant Anomaly Dataset** (`yolo_anomaly_dataset/`)
   - Detects anomalies in plants
   - 1 class: `anomaly`

2. **Fall Detection Dataset** (`fall_dataset/`)
   - Detects fallen/fainted people
   - 1 class: `fallen_person`

## 🚀 Quick Start

### Method 1: Using Python Script (Recommended for Production)

```powershell
# Train on both datasets sequentially
python multi_dataset_yolo_train.py --datasets both --model yolov8n.pt --epochs 50

# Train on plants only
python multi_dataset_yolo_train.py --datasets plants --model yolov8n.pt --epochs 50

# Train on falls only
python multi_dataset_yolo_train.py --datasets falls --model yolov8n.pt --epochs 50

# Use a larger model for better accuracy
python multi_dataset_yolo_train.py --datasets both --model yolov8s.pt --epochs 100
```

### Method 2: Using Jupyter Notebook (Recommended for Experimentation)

1. Open `multi_dataset_training.ipynb` in VS Code or Jupyter
2. Run cells sequentially
3. Modify training parameters as needed
4. Visualize results interactively

## 📊 Training Strategy

### Sequential Training (Transfer Learning)
The script trains in two stages:

```
Stage 1: Base Model (yolov8n.pt)
           ↓
         Train on Dataset 1 (e.g., plants)
           ↓
         Best Model Stage 1
           ↓
Stage 2: Fine-tune on Dataset 2 (e.g., falls)
           ↓
         Final Multi-Task Model
```

**Benefits:**
- Model learns features from both domains
- Better generalization
- Can detect both plant anomalies AND fallen people

## ⚙️ Configuration Options

### Model Selection
- `yolov8n.pt` - Nano (fastest, ~3MB)
- `yolov8s.pt` - Small (better accuracy, ~11MB)
- `yolov8m.pt` - Medium (high accuracy, ~26MB)
- `yolo11n.pt` - YOLO11 Nano (latest version)

### Recommended Settings by GPU

#### RTX 2050 (4GB VRAM)
```python
model = 'yolov8n.pt'
epochs = 50
imgsz = 640
batch = 16
```

#### RTX 3060 (12GB VRAM)
```python
model = 'yolov8s.pt'
epochs = 100
imgsz = 640
batch = 32
```

#### CPU Only
```python
model = 'yolov8n.pt'
epochs = 30
imgsz = 416
batch = 4
```

## 📁 Output Structure

After training, you'll find:

```
multi_dataset_training/
├── stage1_plants_YYYYMMDD_HHMMSS/
│   ├── weights/
│   │   ├── best.pt        # Best model from stage 1
│   │   └── last.pt        # Last checkpoint
│   ├── results.png        # Training curves
│   ├── confusion_matrix.png
│   └── ...
└── stage2_falls_YYYYMMDD_HHMMSS/
    ├── weights/
    │   ├── best.pt        # FINAL MULTI-TASK MODEL ⭐
    │   └── last.pt
    ├── results.png
    └── ...
```

## 🧪 Testing Your Model

### Using Python
```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('multi_dataset_training/stage2_falls_*/weights/best.pt')

# Test on an image
results = model('path/to/image.jpg')
results[0].show()

# Test on a video
results = model('path/to/video.mp4', save=True)
```

### Using Command Line
```powershell
# Predict on image
yolo predict model=path/to/best.pt source=image.jpg

# Predict on video
yolo predict model=path/to/best.pt source=video.mp4

# Predict on webcam
yolo predict model=path/to/best.pt source=0
```

## 📈 Expected Training Times (RTX 2050)

| Dataset | Images | Epochs | Time (approx) |
|---------|--------|--------|---------------|
| Plants  | ~1000  | 50     | 30-40 min     |
| Falls   | ~500   | 50     | 20-30 min     |
| **Total** | -    | 100    | **~1 hour**   |

## 🎯 Performance Metrics

After training, check these metrics:

- **mAP50**: Mean Average Precision at 50% IoU (higher is better, >0.5 is good)
- **mAP50-95**: Mean Average Precision at 50-95% IoU (stricter metric)
- **Precision**: How many detections are correct
- **Recall**: How many ground truth objects were detected

## 🔧 Troubleshooting

### Out of Memory Error
```python
# Reduce batch size
batch = 8  # or even 4

# Reduce image size
imgsz = 416  # instead of 640
```

### Training Too Slow
```python
# Use smaller model
model = 'yolov8n.pt'

# Reduce image size
imgsz = 416

# Reduce epochs
epochs = 30

# Enable caching
cache = 'ram'  # or 'disk'
```

### Poor Performance
```python
# Train longer
epochs = 100

# Use larger model
model = 'yolov8s.pt'

# Increase image size
imgsz = 640

# Add more augmentation
mosaic = 1.0
mixup = 0.2
```

## 📚 Advanced Usage

### Export for Deployment

```python
from ultralytics import YOLO

model = YOLO('path/to/best.pt')

# Export to ONNX (universal)
model.export(format='onnx')

# Export to TensorRT (NVIDIA GPUs)
model.export(format='engine')

# Export to TFLite (mobile/edge)
model.export(format='tflite')

# Export to CoreML (iOS)
model.export(format='coreml')
```

### Combine Datasets (Alternative Approach)

If you want to train on both datasets simultaneously instead of sequentially:

1. Create a combined dataset:
   ```yaml
   # combined_data.yaml
   names:
     - anomaly
     - fallen_person
   nc: 2
   train: path/to/combined/train
   val: path/to/combined/val
   ```

2. Copy images and labels from both datasets into combined folders

3. Train normally:
   ```python
   python multi_dataset_yolo_train.py --datasets combined
   ```

## 📝 Files Created

- ✅ `fall_dataset/data.yaml` - Configuration for fall detection dataset
- ✅ `multi_dataset_yolo_train.py` - Python training script
- ✅ `multi_dataset_training.ipynb` - Interactive Jupyter notebook
- ✅ `MULTI_DATASET_TRAINING_GUIDE.md` - This guide

## 🎓 Learning Resources

- [Ultralytics YOLO Docs](https://docs.ultralytics.com/)
- [Transfer Learning Guide](https://docs.ultralytics.com/guides/transfer-learning/)
- [Hyperparameter Tuning](https://docs.ultralytics.com/guides/hyperparameter-tuning/)

## 💡 Tips for Best Results

1. **Data Quality**: Ensure your datasets are properly labeled
2. **Class Balance**: Try to have similar numbers of images for each class
3. **Augmentation**: More augmentation = better generalization
4. **Validation**: Always validate on unseen data
5. **Iterations**: Don't expect perfect results first time - iterate!

## 🚀 Next Steps

1. Run the training script or notebook
2. Monitor training progress
3. Validate on test images
4. Export model for deployment
5. Integrate into your application

Happy training! 🎉
