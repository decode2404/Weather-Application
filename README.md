# Weather-Application


## 📌 Project Overview
The **Weather App** is a responsive web application that allows users to search for real-time weather information for any city worldwide. It fetches live data from a public weather API and displays essential weather details in a clean and user-friendly interface. This project demonstrates practical usage of asynchronous JavaScript and API integration.

---

## 🎯 Key Features
- Search current weather by city name  
- Display weather details including:
  - Temperature (°C)  
  - Weather condition  
  - Humidity percentage  
  - Wind speed  
  - Weather icon based on conditions  
- Dynamic background changes based on weather status  
- User-friendly error handling for:
  - Invalid city names  
  - Network or API failures  
- Fully responsive design (mobile & desktop)  
- Smooth UI transitions and animations  

---

## 🧠 How It Works
- Users enter a city name and submit the search request  
- JavaScript uses the **Fetch API** with `async / await` to call the weather API  
- The API responds with weather data in **JSON format**  
- The application parses the JSON response and dynamically updates the UI  
- In case of errors (such as an invalid city), a meaningful error message is displayed  

---

## 🛠️ Technologies Used
- **HTML5** – Structure and page layout  
- **CSS3** – Styling, responsiveness, and animations  
- **JavaScript (ES6+)** – Application logic, API handling, DOM updates  
- **Weather API** – Live weather data  

---

## 🚀 JavaScript Concepts Demonstrated
- Fetch API  
- `async / await`  
- Promises  
- JSON parsing  
- DOM manipulation  
- Event handling  
- Error handling using `try...catch`  

---

## ✅ Why This Project Is Important
This project reflects real-world frontend development practices by demonstrating how applications interact with external APIs, handle asynchronous operations, and provide a smooth user experience even during error scenarios.

---

## 📂 Project Structure
```txt
weather-app/
│── index.html
│── style.css
│── script.js
