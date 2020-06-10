import React, { createContext, useCallback, useState, useContext } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

interface AuthState {
  token: string;
  user: User;
}

// Criando o contexto.
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  // Essa logica só vai ser executada quando o usuario der um refresh na pagina
  // ou quando ele sair e voltar pro sistema etc
  const [data, setData] = useState<AuthState>(() => {
    // busca o token e user no localStorage;
    const token = localStorage.getItem('@GoBarber:token');
    const user = localStorage.getItem('@GoBarber:user');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });
  // Metodo que faz autenticação
  const signIn = useCallback(async ({ email, password }) => {
    // Iremos passar para a rota session o email e o password
    // que estamos recebendo do signIn
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Salva token e user no localStorage;
    localStorage.setItem('@GoBarber:token', token);
    localStorage.setItem('@GoBarber:user', JSON.stringify(user));

    // Define como padrão o cabeçalho authorization com esse valor
    // Deixa automatico todas as requisições que acontecerem para API.
    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    // remove os dois dados do localStorage
    localStorage.removeItem('@GoBarber:token');
    localStorage.removeItem('@GoBarber:user');

    // Seta com objeto vazio onde esta setado o user e o token
    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@GoBarber:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
