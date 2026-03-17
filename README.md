# ZipLink - URL Shortener

A full-stack URL shortener application built with **Spring Boot** (backend) and **React** (frontend), inspired by Bitly. Transform long URLs into short, shareable links with QR code generation and click analytics.

![Java](https://img.shields.io/badge/java-17-orange.svg)
![React](https://img.shields.io/badge/react-19.2-blue.svg)

## 🌐 Live Demo

- **Frontend**: https://ziplink-ten.vercel.app/
- **Backend API**: https://ziplink-i7s3.onrender.com/

## ✨ Features

- 🔗 **URL Shortening** - Convert long URLs into short, memorable codes
- 🎯 **Custom Codes** - Create custom short codes for your links
- 📊 **Analytics** - Track total clicks and visualize click trends over time
- 🔐 **QR Codes** - Generate QR codes for each shortened URL
- 📋 **Copy to Clipboard** - Easy one-click copying of shortened links
- 📝 **Link History** - View recent shortened URLs
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.1
- **Language**: Java 17
- **Database**: PostgreSQL
- **ORM**: Hibernate (Spring Data JPA)
- **Build Tool**: Maven

### Frontend
- **Library**: React 19.2
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **QR Code**: qrcode.react
- **Build Tool**: Create React App (react-scripts)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher
- **Node.js** 16+ and npm
- **Maven** 3.6+
- **PostgreSQL** 12+ (or any PostgreSQL-compatible database)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anshul-rautela/ziplink.git
cd ziplink
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (Maven downloads them automatically)
mvn clean install

# Update application.properties with your database credentials
# Edit src/main/resources/application.properties
```

**Configure Database:**

Update `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ziplink
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file for API configuration (optional)
# The API URL is configured in src/config.js
```

**Configure API URL:**

Edit `frontend/src/config.js`:

```javascript
const API_URL = 'http://localhost:8080'; // or your backend URL
export default API_URL;
```

## 🏃 Running the Application

### Start Backend

```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Start Frontend (in another terminal)

```bash
cd frontend
npm start
```

The frontend will automatically open at `http://localhost:3000`

## 📁 Project Structure

```
ziplink/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/urlShortener/
│   │   │   │   ├── BitlyCloneApplication.java
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── config.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔌 API Endpoints

### POST `/shorten`
Shorten a URL

**Request:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "customCode": "my-link" // optional
}
```

**Response:**
```json
{
  "shortCode": "abc123"
}
```
```

### GET `/{shortCode}`
Redirect to original URL (records a click)

## 🐳 Docker Deployment

### Build Docker Image

```bash
cd backend
docker build -t ziplink-backend .
```

### Run with Docker

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ziplink \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=password \
  ziplink-backend
```

## 📦 Building for Production

### Build Backend

```bash
cd backend
mvn clean package
# Output: target/bitly-clone-0.0.1-SNAPSHOT.jar
```

### Build Frontend

```bash
cd frontend
npm run build
# Output: build/ directory
```

## 🔑 Key Features Explained

### URL Shortening Algorithm
- Uses **Base62 Encoding** for generating short codes
- Random generation for unspecified codes
- Custom code validation to prevent conflicts

### Analytics Tracking
- Records click timestamps for each shortened URL
- Aggregates clicks by day for trend visualization
- Supports time-series data visualization with Recharts

### QR Code Generation
- Dynamically generates QR codes using qrcode.react
- QR codes point to the shortened URL
- Can be scanned directly by mobile devices

## 🐛 Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running
- Check database credentials in `application.properties`
- Verify Java 17 is installed: `java -version`

### Frontend can't connect to backend
- Ensure backend is running on port 8080
- Check `frontend/src/config.js` API URL
- Verify CORS is enabled in backend

### Database connection issues
- Check PostgreSQL connection string
- Verify database user permissions
- Ensure the database exists: `createdb ziplink`

##  Author

Created with ❤️ as a demonstration of full-stack web development with Spring Boot and React.

## 🙏 Acknowledgments

- Inspired by [Bitly](https://bitly.com)
- Built with [Spring Boot](https://spring.io/projects/spring-boot)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Charts powered by [Recharts](https://recharts.org)
- QR codes generated with [qrcode.react](https://github.com/davidosomething/qrcode.react)

---

**Made with 🔗 ZipLink**
