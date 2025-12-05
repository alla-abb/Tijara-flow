# 🇩🇿 Tijara-Flow | The AI Creative Studio for DZ Sellers

**Tijara-Flow** is an advanced AI-powered web application designed specifically for the Algerian e-commerce market ("E-com DZ"). It streamlines the workflow for sellers by transforming raw product photos into professional, market-ready advertisements using the latest **Google Gemini Models**.

## 🚀 The Core Shift

Unlike generic editing tools, Tijara-Flow is context-aware. It understands the Algerian "Soug" (Market), speaks "Derja" (Local Dialect), and uses visual generative AI to place products in culturally relevant or high-converting settings.

## ✨ Key Features

### 1. 📸 Visual Engine (Scene Hallucination)
*   **Technology:** `gemini-2.5-flash-image` (Nano Banana 2.5)
*   **Function:** Automatically removes background clutter and "hallucinates" professional scenes (e.g., Casbah streets, Sahara dunes, Neon Studios, Luxury Interiors) while preserving product lighting and integrity.

### 2. ✍️ Derja Copywriter (Thinking Model)
*   **Technology:** `gemini-3-pro-preview` with **Thinking Config**
*   **Function:** Generates high-converting ad copy in:
    *   **Darija (Arabic Script)**
    *   **Darija (Latin/Francos)**
    *   **French & English**
*   **Strategy:** Uses an internal reasoning budget to craft hooks, scarcity, and call-to-actions tailored to Algerian consumers (delivery to 58 wilayas, cash on delivery, etc.).

### 3. 📊 Soug Analyst (Market Intelligence)
*   **Technology:** `gemini-3-pro-preview` + **Google Search Grounding**
*   **Function:** Scrapes and analyzes real-time data from platforms like **OuedKniss**, **Facebook Marketplace DZ**, and **Jumia**.
*   **Output:** Provides estimated price ranges (in DZD), sales recommendations, and citations.

### 4. 🎨 Auto Design Studio
*   **Technology:** HTML5 Canvas Engine
*   **Function:** A drag-and-drop editor with smart presets:
    *   **Modern:** Clean, emerald themes.
    *   **Luxury:** Gold/Serif fonts for high-end items.
    *   **Sale:** High urgency red/starburst badges.
    *   **Street:** Edgy, urban aesthetic.
*   **Features:** Customizable typography (Playfair, Oswald, Inter), shapes, and gradients.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite) + TypeScript
*   **Styling:** TailwindCSS
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **Fonts:** Google Fonts (Inter, Playfair Display, Oswald)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A Google Cloud Project with the **Gemini API** enabled.
*   **API Key:** You need a paid/valid API key that supports `gemini-3-pro-preview` and `gemini-2.5-flash-image`.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/tijara-flow.git
    cd tijara-flow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
    *Note: In the provided code structure, the API key is expected via `process.env.API_KEY`. Ensure your bundler (Vite/Webpack) is configured to expose this safely, or use a backend proxy for production.*

4.  **Run the App**
    ```bash
    npm run dev
    ```

---

## 📖 Usage Workflow

1.  **Upload:** Snap a picture of your product (shoes, watches, electronics, etc.).
2.  **Visual:** Choose a vibe (e.g., "Algiers Street") and let AI replace the background.
3.  **Copy:** Select your target language (e.g., Darija) and generate the caption.
4.  **Analyze:** Get pricing insights from the Algerian market.
5.  **Design:** Apply a template, adjust the price badge, and download the PNG.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for DZ Sellers.**
