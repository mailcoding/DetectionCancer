#!/bin/bash

echo "🔧 Test de la configuration CORS"
echo "================================"

# URL du backend (local pour test, puis production)
BACKEND_URL="http://localhost:8000"
FRONTEND_ORIGIN="https://detectioncancerfront.onrender.com"

echo "📡 Test 1: Requête OPTIONS preflight"
echo "-----------------------------------"
curl -X OPTIONS \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v "$BACKEND_URL/detection/login/" 2>&1 | head -20

echo ""
echo "📡 Test 2: Requête POST réelle"
echo "-----------------------------"
curl -X POST \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -v "$BACKEND_URL/detection/login/" 2>&1 | head -15

echo ""
echo "📡 Test 3: Health check"
echo "----------------------"
curl -X GET \
  -H "Origin: $FRONTEND_ORIGIN" \
  "$BACKEND_URL/detection/health/" | jq '.' 2>/dev/null || cat

echo ""
echo "✅ Tests CORS terminés"
