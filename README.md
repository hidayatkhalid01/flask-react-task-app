# Flask React App

This is a demo app for Task Management system that uses Flask as Backend and React as Frontend. 

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```
## Local Setup (Without Docker)
### Backend setup
1. Clone the repo and run.
```bash
cd backend
python -m venv venv
```

2. Then activate the app.

Windows: 
```bash
venv\Scripts\activate
```

Mac: 
```bash
source venv/bin/activate
```

3. Then install dependencies
```bash
pip install -r requirements.txt
```

4. Then run database migration
```bash
flask db upgrade
```

5. And start the server
```bash
flask run
```

6. The backend will run at [http://localhost:5000](http://localhost:5000)

### Frontend setup
1. Install frontend dependencies
```bash
cd frontend
npm install
```
2. Create frontend .env
```bash
VITE_API_URL=http://localhost:5000
```
3. Start frontend
```bash
npm run dev
```

4. The frontend will run at [http://localhost:5173](http://localhost:5173)

## Docker Setup
1. Inside frontend directory, clone .env.example and rename it to .env

2. From project root, run
```bash
docker compose up --build
```
3. Then run a database migration in a new terminal
```bash
docker compose exec backend flask db upgrade
```
4. Now you can access the app at: 
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend [http://localhost:5000](http://localhost:5000)
- Database localhost:3306


## Usage
1. Open [http://localhost:5173/auth/login](http://localhost:5173/auth/login) to login or [http://localhost:5173/register](http://localhost:5173/register) register.
2. Enter your email and password
3. Once logged in, you will be redirected to /dashboard to view all tasks and now are able to create, update, and delete task.
