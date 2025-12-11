#!/bin/bash

echo "🚀 Setting up OB/GYN Clinic Database..."
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "✅ Docker is running"
        echo ""
        echo "Starting PostgreSQL with Docker..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 5
        
        # Wait for PostgreSQL to be ready
        for i in {1..30}; do
            if docker exec obgyn_clinic_db pg_isready -U postgres &> /dev/null; then
                echo "✅ PostgreSQL is ready!"
                break
            fi
            echo "   Waiting... ($i/30)"
            sleep 1
        done
        
        echo ""
        echo "✅ Database setup complete!"
        echo ""
        echo "📝 Database credentials:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: obgyn_clinic"
        echo "   Username: postgres"
        echo "   Password: postgres"
        
    else
        echo "❌ Docker is installed but not running"
        echo ""
        echo "Please start Docker Desktop and run this script again,"
        echo "or install PostgreSQL locally:"
        echo ""
        echo "  brew install postgresql@14"
        echo "  brew services start postgresql@14"
        echo "  createdb obgyn_clinic"
        exit 1
    fi

# Check if PostgreSQL is installed locally
elif command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found locally"
    echo ""
    echo "Creating database..."
    
    # Try to create database
    if createdb obgyn_clinic 2>/dev/null; then
        echo "✅ Database 'obgyn_clinic' created successfully!"
    else
        echo "⚠️  Database might already exist or there was an error"
        echo "   Continuing anyway..."
    fi
    
    echo ""
    echo "✅ Database setup complete!"
    
else
    echo "❌ Neither Docker nor PostgreSQL found"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "Option 1 - Docker (Recommended):"
    echo "  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    echo "  2. Start Docker Desktop"
    echo "  3. Run this script again"
    echo ""
    echo "Option 2 - PostgreSQL locally:"
    echo "  brew install postgresql@14"
    echo "  brew services start postgresql@14"
    echo "  createdb obgyn_clinic"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "  1. Make sure backend/.env has correct database credentials"
echo "  2. Run: cd backend && npm run seed:users"
echo "  3. Start backend: npm run start:dev"
echo "  4. Login with: admin / admin123"

