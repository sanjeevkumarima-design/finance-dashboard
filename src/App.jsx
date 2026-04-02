import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/UI/Card';
import { Button } from './components/UI/Button';
import { Select, SelectItem } from './components/UI/Select';
import Dashboard from './components/Dashboard/Dashboard';
import Transactions from './components/Transactions/Transactions';
import Insights from './components/Insights/Insights';
import useFinanceStore from './store/financeStore';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  User, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';

function App() {
  const { 
    role, 
    setRole, 
    darkMode, 
    toggleDarkMode,
    getFilteredTransactions,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses
  } = useFinanceStore();

  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transactions', icon: Receipt },
    { id: 'insights', name: 'Insights', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'insights':
        return <Insights />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
              <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {role === 'admin' ? 'Admin' : 'Viewer'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-24"
                >
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className={`border-b bg-card ${isMobileMenuOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 mb-8 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-lg font-semibold ${getTotalBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(getTotalBalance())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Income</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(getTotalIncome())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(getTotalExpenses())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {renderContent()}
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Finance Dashboard - Track your financial activity with ease</p>
            <p className="mt-1">Current role: <span className="font-medium">{role === 'admin' ? 'Administrator' : 'Viewer'}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
