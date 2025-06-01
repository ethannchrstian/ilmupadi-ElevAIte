# Sahabat Tani - Leaf Scanner AI & Farmer's Companion

Sahabat Tani is a web application designed to assist rice farmers by providing AI-powered leaf disease detection, a community forum, and agricultural news. Users can upload images of rice plant leaves to get an AI-based diagnosis, along with detailed information about symptoms, treatments, and prevention methods.

## ✨ Features

* **AI Disease Detection:** Upload images of rice plant leaves for AI-powered disease identification using Azure Custom Vision.
* **Detailed Diagnosis:** Receive comprehensive information including:
    * User-friendly disease name
    * Description and severity
    * Common symptoms
    * Categorized treatment options (e.g., Bakterisida, Biologis, Fungisida, Kultur Teknis)
    * Prevention strategies
* **User Authentication:** Secure login and registration system.
* **Personalized Dashboard:**
    * Overview of user's activity (total analyses, post count).
    * Counts of healthy vs. diseased plants from their analyses.
* **Analysis History:**
    * View past scan results with user-friendly disease names.
    * Access detailed information (symptoms, treatments, prevention) for each historical analysis via a modal.
    * Pagination ("Load More") for Browse extensive history.
    * Ability to delete own analysis records.
* **Community Forum:**
    * View posts from other users.
    * Authenticated users can create new posts.
    * Authenticated users can delete their own posts.
    * (Future enhancements could include comments/replies, editing posts).
* **Agricultural News:**
    * Stay updated with the latest news related to farming, plant diseases, and agricultural technology.
    * Pagination for Browse news articles.
* **Responsive Design:** User interface designed to adapt to various device sizes.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Lucide React (for icons)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma
* **AI Service:** Microsoft Azure Custom Vision
* **Containerization:** Docker, Docker Compose

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your local system:
* [Git](https://git-scm.com/downloads)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (which includes Docker Engine and Docker Compose)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### 1. Clone the Repository

First, clone this repository to your local machine:
```bash
git clone [https://github.com/ethannchrstian/ilmupadi-ElevAIte.git](https://github.com/ethannchrstian/ilmupadi-ElevAIte.git)
cd ilmupadi-ElevAIte
```

### 2. Set Up Environment Variables

The backend server requires environment variables for database connections and external API keys.

1.  **Edit `server/.env.sample`:**
    Edit `server/.env.sample` name into `server/.env` and replace the placeholder values (e.g., `YOUR_NEWS_API_KEY_HERE`) with your actual keys and configuration details.


### 3. Build and Run with Docker Compose

From the **project root directory** where `docker-compose.yml` file is located, run:

```bash
docker-compose up -d --build
```

* `up`: Creates and starts all services defined in your `docker-compose.yml`.
* `-d`: Runs the containers in detached mode (in the background).
* `--build`: Forces Docker to build the images for your `client` and `server` services before starting. This is good practice if you've made changes to `Dockerfile` or related source files.

This command will:
* Build the Docker images.
* Start the `db` (PostgreSQL), `server` (Node.js/Express backend), `client` (React/Vite frontend), and `prisma-studio` services.
* The `server` service's startup command automatically runs `npm install`, `npx prisma generate`, and `npx prisma migrate deploy` to set up the database schema based on your committed Prisma migrations.

### 4. Accessing the Application

* **Frontend Application:** Open your browser and navigate to `http://localhost:5173`
* **Backend API Health Check (example):** `http://localhost:5000/api/health`
* **Prisma Studio (Database GUI):** Open your browser and navigate to `http://localhost:5555`

### 5. Stopping the Application

To stop all running Docker containers for this project, navigate to the project root directory in your terminal and execute:

```bash
docker-compose down
```
If you also want to remove the named volumes (this **will delete your database data** and any other data persisted in named volumes, useful for a complete reset), use:
```bash
docker-compose down -v
```

## 🔧 Development Workflow (Database Schema Changes)

When making changes to your database schema (`server/prisma/schema.prisma`):

1.  Ensure your Docker containers are running (`docker-compose up -d`).
2.  Execute the `prisma migrate dev` command inside the `server` container. This will generate a new SQL migration file and apply it to your development database:
    ```bash
    docker-compose exec server sh -c 'npx prisma migrate dev --name "your_descriptive_migration_name"'
    ```
    Replace `"your_descriptive_migration_name"` with a short, meaningful name for your schema change (e.g., `add_user_profile_bio`, `create_comments_table`).
3.  This command creates new files in the `server/prisma/migrations` directory.
4.  **Important:** Add and commit these new migration files to your Git repository.

This workflow ensures that the `npx prisma migrate deploy` command (run automatically on server startup by `docker-compose`) can correctly set up or update the database schema for anyone else running the project or in deployment environments.

## 📂 Project Structure (Simplified Overview)

```
your-repository-name/
├── client/             # Frontend React/Vite application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── utils/          # Shared frontend utilities (e.g., diseaseUtils.js)
│       ├── App.jsx
│       └── main.jsx
├── server/             # Backend Node.js/Express application
│   ├── prisma/
│   │   ├── migrations/   # Prisma migration files (commit these)
│   │   └── schema.prisma # Your database schema definition
│   ├── routes/           # API route definitions
│   ├── uploads/          # Temporary storage for image uploads (should be in .gitignore)
│   ├── .env              # Local environment variables (MUST be in .gitignore)
│   ├── .env.sample       # Example environment variables (commit this)
│   ├── Dockerfile
│   ├── index.js          # Main server entry point
│   └── package.json
├── .dockerignore         # Specifies files to ignore when building Docker images
├── .gitignore            # Specifies intentionally untracked files that Git should ignore
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## 🤝 Contributing

(Optional: If you are open to contributions, you can add guidelines here. For example: "Contributions are welcome! Please fork the repository, create a new branch for your feature or fix, and submit a pull request. Ensure your code follows the existing style and all tests pass.")

## 📜 License

(Optional: Specify your project's license. If you haven't chosen one, consider a common open-source license like MIT. Example: "This project is licensed under the MIT License. See the `LICENSE` file for details.")
If you add a `LICENSE` file to your repository, update this section accordingly.
```

This should now be a single, complete Markdown block that you can directly copy and paste into your `README.md` file. Let me know if you face any further issues with it!