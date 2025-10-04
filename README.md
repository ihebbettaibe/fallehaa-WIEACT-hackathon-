# 🌾 Fallehaa - WIEACT Hackathon Project

**Empowering Tunisian Women Farmers through Technology**
Here is the RAG repo : https://github.com/Arslen-Hedhli/rag-wieact.git


Fallehaa is a comprehensive web-based platform designed to support Tunisian women farmers through innovative technology solutions. The platform combines semi-autonomous drone technology with AI-powered detection systems, edge computing for real-time alerts, and a digital marketplace to improve knowledge access and promote fair trade practices.

---

## ✨ Features and Objectives

### Core Features
- **🚁 Semi-Autonomous Drone System**: Automated field monitoring and surveillance
- **🤖 YOLO-Based Detection**: Real-time detection of:
  - Emergency situations (fires, floods, injuries)
  - Crop anomalies (diseases, pests, irrigation issues)
- **📡 Raspberry Pi Edge Unit**: Real-time alert processing and notifications
- **🛒 Digital Marketplace**: Fair trade platform connecting farmers directly with buyers
- **📚 Knowledge Hub**: Educational resources and best practices for farming

### Project Objectives
1. Enhance farm safety through automated emergency detection
2. Improve crop health monitoring and early anomaly detection
3. Provide real-time alerts to farmers for timely interventions
4. Enable fair market access through a digital marketplace
5. Promote knowledge sharing and agricultural education
6. Support economic empowerment of women farmers in Tunisia

---

## 📊 Datasets Used

The project leverages several datasets for training and validation:

- **Crop Disease Dataset**: Images of various crop diseases and pests for model training
- **Emergency Detection Dataset**: Images for fire, flood, and emergency situation detection
- **Agricultural Data**: Local climate, soil, and crop yield data from Tunisian regions
- **Custom Annotated Dataset**: Field data collected from drone imagery

*Note: Datasets are stored in the `/data` directory. See [data/README.md](data/README.md) for details.*

---

## 🚀 Installation Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 14+ (for web platform)
- Raspberry Pi OS (for edge unit)
- Drone SDK (specific to drone model)
- CUDA-compatible GPU (recommended for model training)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ihebbettaibe/fallehaa-WIEACT-hackathon-.git
   cd fallehaa-WIEACT-hackathon-
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install YOLO dependencies**
   ```bash
   # For YOLOv8
   pip install ultralytics
   ```

4. **Set up the web platform**
   ```bash
   cd src/platform
   npm install
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

---

## 📓 How to Run the Notebook/Demo

### Running Jupyter Notebooks

1. **Start Jupyter Notebook server**
   ```bash
   jupyter notebook
   ```

2. **Navigate to the notebooks directory**
   - Open `notebooks/` in the Jupyter interface
   - Available notebooks:
     - `01_data_exploration.ipynb` - Exploratory data analysis
     - `02_model_training.ipynb` - YOLO model training
     - `03_detection_demo.ipynb` - Live detection demonstration

### Running the Demo

1. **Start the backend server**
   ```bash
   cd src/platform
   python app.py
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   cd src/platform/frontend
   npm start
   ```

3. **Access the platform**
   - Open your browser to `http://localhost:3000`
   - Login with demo credentials (see documentation)

### Testing the Detection System

```bash
# Run detection on sample images
python src/models/detect.py --source data/sample_images/ --weights models/best.pt

# Run detection on video
python src/models/detect.py --source data/sample_video.mp4 --weights models/best.pt
```

---

## 📁 Project Structure

```
fallehaa-WIEACT-hackathon-/
├── data/               # Datasets and data files
├── notebooks/          # Jupyter notebooks for analysis and demos
├── src/                # Source code
│   ├── models/         # YOLO detection models
│   ├── edge/           # Raspberry Pi edge code
│   ├── platform/       # Web platform (frontend + backend)
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── README.md           # This file
└── requirements.txt    # Python dependencies
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ License and copyright notice required

---

## 👥 Team

**WIEACT Hackathon Team**
- Project developed for the WIEACT Hackathon
- Supporting Tunisian women farmers through technology

---

## 📧 Contact

For questions, suggestions, or collaborations, please reach out:
- GitHub Issues: [Report an issue](https://github.com/ihebbettaibe/fallehaa-WIEACT-hackathon-/issues)
- Email: *[Contact information to be added]*

---

## 🙏 Acknowledgments

- WIEACT Hackathon organizers
- Tunisian agricultural communities
- Open-source contributors and libraries used in this project

---

**Made with ❤️ for Tunisian Women Farmers**
