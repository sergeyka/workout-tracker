#!/bin/bash

if [ "$1" = "frontend" ]; then
    cd frontend && REACT_APP_API_URL=http://127.0.0.1:5001/api npm start
elif [ "$1" = "backend" ]; then
    cd backend && npm run dev
else
    echo "Usage: ./dev.sh [frontend|backend]"
    exit 1
fi