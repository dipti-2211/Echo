# AI Chatbot Application

A modern, professional AI Chatbot application built with React and Tailwind CSS featuring a premium dark mode aesthetic.

## Features

- **Premium Dark Theme**: Deep greys (#1a1a1a, #2d2d2d) and pure blacks with subtle borders and shadows
- **Authentication**: Frosted-glass effect login with Google Sign-In and personalization name input
- **Collapsible Sidebar**: Chat history with dummy data
- **Dynamic Header**: Personalized greeting and theme toggle (Grey/Black vs OLED Black)
- **Chat Interface**: Clean message stream with distinct bubbles for User vs AI
- **Responsive Design**: Modern, minimalist UI with rounded corners and clean typography

## Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Project Structure

```
ai-chatbot/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login component with Google Sign-In
│   │   ├── Sidebar.jsx        # Collapsible sidebar with chat history
│   │   ├── Header.jsx         # Header with greeting and theme toggle
│   │   └── ChatArea.jsx       # Main chat interface
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.cjs
```

## Design Specifications

- **Colors**:

  - Deep Grey Dark: #1a1a1a
  - Deep Grey Light: #2d2d2d
  - Premium Black: #000000
  - Grey Border: #404040
  - Grey Text: #a0a0a0

- **Typography**: Inter font family with clean sans-serif fallback
- **Effects**: Frosted-glass backdrop blur, smooth transitions, custom scrollbars
- **Layout**: Flexible, responsive layout with collapsible sidebar

## Components

### Login

- Frosted-glass effect card
- Google Sign-In button with icon
- Personalization name input field
- Gradient text effects

### Sidebar

- Collapsible design
- Chat history with timestamps
- New chat button
- User profile at bottom

### Header

- Personalized greeting
- Theme toggle switch (Grey/Black ↔ OLED Black)
- Clean, minimal design

### ChatArea

- Message bubbles for User and AI
- Auto-scrolling
- Input field with send button
- Timestamp for each message

## Technologies

- **React 18.3.1**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS 3.4.14**: Utility-first CSS framework
- **PostCSS & Autoprefixer**: CSS processing

## License

MIT
