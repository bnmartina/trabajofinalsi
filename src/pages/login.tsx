import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/components_ui';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Simulamos una petición al backend
    const promise = new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.promise(promise, {
      loading: 'Verificando credenciales...',
      success: () => {
        login(); // Actualiza el contexto y localStorage
        navigate('/reportes'); // Redirige a la zona privada
        return isLogin ? 'Bienvenido al sistema' : 'Registro completado con éxito';
      },
      error: 'Error al conectar',
    });
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-[80vh] flex items-center justify-center animate-fade-in bg-slate-50/50">
      <Card className="w-full max-w-md shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 border-t-4 border-t-emerald-600 bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit mb-2 ring-1 ring-emerald-200">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Ingresa tus credenciales para acceder a los reportes.' 
              : 'Registra tu empresa u organismo para comenzar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                {/* Iconos con tono verde sutil */}
                <User className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
                <Input type="text" placeholder="Nombre completo o Razón Social" className="pl-10 focus:border-emerald-500" required />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
              <Input type="email" placeholder="Correo electrónico" className="pl-10" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
              <Input type="password" placeholder="Contraseña" className="pl-10" required />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
                <Input type="password" placeholder="Confirmar contraseña" className="pl-10" required />
              </div>
            )}

            <Button type="submit" className="w-full group bg-blue-600 hover:bg-blue-700">
              {isLogin ? 'Ingresar al Sistema' : 'Registrarse'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-emerald-600 font-bold hover:text-emerald-700 hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;