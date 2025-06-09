// File: App.tsx
import LogoSection from './components/LogoSection';
import LoginForm from './components/LoginForm';

const App = () => {
  return (
    <div className="flex h-screen bg-gray-200 items-center justify-center">
      <div className="flex flex-col md:flex-row gap-8 md:gap-32 items-center">
        <LogoSection />
        <LoginForm />
      </div>
    </div>
  );
};

export default App;
