#!/bin/bash
# setup-env.sh - Quick environment configuration script

echo "🔧 Kita Punya Catatan - Environment Setup"
echo "========================================"

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    local env_file=".env"
    
    if grep -q "^${key}=" "$env_file"; then
        # Update existing key
        sed -i "s|^${key}=.*|${key}=${value}|" "$env_file"
    else
        # Add new key
        echo "${key}=${value}" >> "$env_file"
    fi
    echo "✅ Updated ${key}=${value}"
}

# Function to comment out a line
comment_env() {
    local key=$1
    local env_file=".env"
    
    sed -i "s|^${key}=|# ${key}=|" "$env_file"
    echo "💭 Commented out ${key}"
}

# Environment selection
echo ""
echo "Pilih environment setup:"
echo "1) Local Development (localhost:5173)"
echo "2) Ngrok Development (*.ngrok.io dengan /a path)"
echo "3) Production dengan Subdomain (frontend & api subdomain)"
echo "4) Production dengan Path (domain.com/a untuk backend)"
echo "5) Show current config"
echo ""
read -p "Pilihan (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🏠 Setting up for Local Development..."
        
        update_env "VITE_DOMAIN_BASE" "localhost"
        update_env "VITE_DOMAIN_PROTOCOL" "http"
        update_env "VITE_FRONTEND_PORT" "5173"
        update_env "VITE_BACKEND_PATH" "/a"
        update_env "VITE_BACKEND_DOMAIN" ""
        update_env "VITE_NODE_ENV" "development"
        update_env "VITE_ENABLE_DEBUG" "true"
        update_env "VITE_USE_SUBDOMAIN" "false"
        
        echo ""
        echo "✅ Local development setup complete!"
        echo "🚀 URLs will be:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:5173/a"
        echo "   API:      http://localhost:5173/a/api"
        ;;
        
    2)
        echo ""
        read -p "Enter your ngrok domain (e.g., abc123.ngrok.io): " ngrok_domain
        
        if [ -z "$ngrok_domain" ]; then
            echo "❌ Domain cannot be empty"
            exit 1
        fi
        
        echo "🌐 Setting up for Ngrok Development..."
        
        update_env "VITE_DOMAIN_BASE" "$ngrok_domain"
        update_env "VITE_DOMAIN_PROTOCOL" "https"
        comment_env "VITE_FRONTEND_PORT"
        update_env "VITE_BACKEND_PATH" "/a"
        update_env "VITE_BACKEND_DOMAIN" ""
        update_env "VITE_NODE_ENV" "development"
        update_env "VITE_ENABLE_DEBUG" "true"
        update_env "VITE_USE_SUBDOMAIN" "false"
        
        echo ""
        echo "✅ Ngrok development setup complete!"
        echo "🚀 URLs will be:"
        echo "   Frontend: https://$ngrok_domain"
        echo "   Backend:  https://$ngrok_domain/a"
        echo "   API:      https://$ngrok_domain/a/api"
        ;;
        
    3)
        echo ""
        echo "📌 Production dengan Subdomain Setup"
        echo "   Contoh: Frontend di kitapunya.web.id"
        echo "           Backend di api.kitapunya.web.id"
        echo ""
        read -p "Enter your frontend domain (e.g., kitapunya.web.id): " frontend_domain
        read -p "Enter your backend domain (e.g., api.kitapunya.web.id): " backend_domain
        
        if [ -z "$frontend_domain" ] || [ -z "$backend_domain" ]; then
            echo "❌ Domains cannot be empty"
            exit 1
        fi
        
        echo "🏭 Setting up for Production with Subdomains..."
        
        update_env "VITE_DOMAIN_BASE" "$frontend_domain"
        update_env "VITE_BACKEND_DOMAIN" "$backend_domain"
        update_env "VITE_DOMAIN_PROTOCOL" "https"
        comment_env "VITE_FRONTEND_PORT"
        update_env "VITE_BACKEND_PATH" ""
        update_env "VITE_NODE_ENV" "production"
        update_env "VITE_ENABLE_DEBUG" "false"
        update_env "VITE_USE_SUBDOMAIN" "true"
        
        echo ""
        echo "✅ Production subdomain setup complete!"
        echo "🚀 URLs will be:"
        echo "   Frontend: https://$frontend_domain"
        echo "   Backend:  https://$backend_domain"
        echo "   API:      https://$backend_domain/api"
        echo ""
        echo "⚠️  Important: Make sure both domains point to your server!"
        echo "   - $frontend_domain → Your frontend server"
        echo "   - $backend_domain → Your backend server"
        ;;
        
    4)
        echo ""
        read -p "Enter your production domain (e.g., yourdomain.com): " prod_domain
        
        if [ -z "$prod_domain" ]; then
            echo "❌ Domain cannot be empty"
            exit 1
        fi
        
        echo "🏭 Setting up for Production with Path..."
        
        update_env "VITE_DOMAIN_BASE" "$prod_domain"
        update_env "VITE_DOMAIN_PROTOCOL" "https"
        comment_env "VITE_FRONTEND_PORT"
        update_env "VITE_BACKEND_PATH" "/a"
        update_env "VITE_BACKEND_DOMAIN" ""
        update_env "VITE_NODE_ENV" "production"
        update_env "VITE_ENABLE_DEBUG" "false"
        update_env "VITE_USE_SUBDOMAIN" "false"
        
        echo ""
        echo "✅ Production setup complete!"
        echo "🚀 URLs will be:"
        echo "   Frontend: https://$prod_domain"
        echo "   Backend:  https://$prod_domain/a"
        echo "   API:      https://$prod_domain/a/api"
        ;;
        
    5)
        echo ""
        echo "📋 Current Environment Configuration:"
        echo "===================================="
        
        if [ -f ".env" ]; then
            echo ""
            echo "📄 .env file contents:"
            cat .env | grep -E "^VITE_" | grep -v "CLIENT_ID"
            echo ""
            
            # Extract values for URL display
            domain_base=$(grep "^VITE_DOMAIN_BASE=" .env | cut -d'=' -f2)
            backend_domain=$(grep "^VITE_BACKEND_DOMAIN=" .env | cut -d'=' -f2)
            domain_protocol=$(grep "^VITE_DOMAIN_PROTOCOL=" .env | cut -d'=' -f2)
            frontend_port=$(grep "^VITE_FRONTEND_PORT=" .env | cut -d'=' -f2)
            backend_path=$(grep "^VITE_BACKEND_PATH=" .env | cut -d'=' -f2)
            use_subdomain=$(grep "^VITE_USE_SUBDOMAIN=" .env | cut -d'=' -f2)
            
            if [ ! -z "$domain_base" ]; then
                # Frontend URL
                if [ "$domain_base" = "localhost" ] && [ ! -z "$frontend_port" ]; then
                    frontend_url="${domain_protocol}://${domain_base}:${frontend_port}"
                else
                    frontend_url="${domain_protocol}://${domain_base}"
                fi
                
                # Backend URL
                if [ "$use_subdomain" = "true" ] && [ ! -z "$backend_domain" ]; then
                    backend_url="${domain_protocol}://${backend_domain}"
                else
                    backend_url="${frontend_url}${backend_path}"
                fi
                
                echo "🚀 Computed URLs:"
                echo "   Frontend: $frontend_url"
                echo "   Backend:  $backend_url"
                echo "   API:      $backend_url/api"
            fi
        else
            echo "❌ .env file not found!"
        fi
        
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔄 Next steps:"
echo "1. Restart your development server"
echo "2. Check the browser console for config info"
echo "3. Verify API endpoints are working"
echo ""
echo "💡 Tips:"
echo "- Run './setup-env.sh' anytime to change configuration"
echo "- Check browser console in dev mode for debugging info"
echo "- Make sure nginx/server is configured correctly for your chosen setup"
echo ""
echo "🎉 Setup complete! Happy coding!"