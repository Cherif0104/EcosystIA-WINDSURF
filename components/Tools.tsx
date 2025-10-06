import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';

interface Tool {
  id: number;
  name: string;
  category: 'calculator' | 'converter' | 'generator' | 'utility';
  description: string;
  icon: string;
  isActive: boolean;
}

const Tools: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // Données d'exemple
  const [tools] = useState<Tool[]>([
    {
      id: 1,
      name: 'Calculatrice FCFA',
      category: 'calculator',
      description: 'Calculatrice spécialisée pour les calculs en FCFA',
      icon: '🧮',
      isActive: true
    },
    {
      id: 2,
      name: 'Convertisseur de devises',
      category: 'converter',
      description: 'Conversion entre FCFA, EUR, USD et autres devises',
      icon: '💱',
      isActive: true
    },
    {
      id: 3,
      name: 'Générateur de mots de passe',
      category: 'generator',
      description: 'Génération de mots de passe sécurisés',
      icon: '🔐',
      isActive: true
    },
    {
      id: 4,
      name: 'Générateur de QR Code',
      category: 'generator',
      description: 'Création de codes QR pour vos contenus',
      icon: '📱',
      isActive: true
    },
    {
      id: 5,
      name: 'Calculatrice de pourcentages',
      category: 'calculator',
      description: 'Calculs de pourcentages et variations',
      icon: '📊',
      isActive: true
    },
    {
      id: 6,
      name: 'Convertisseur d\'unités',
      category: 'converter',
      description: 'Conversion entre différentes unités de mesure',
      icon: '📏',
      isActive: true
    },
    {
      id: 7,
      name: 'Générateur de couleurs',
      category: 'generator',
      description: 'Palette de couleurs et codes hexadécimaux',
      icon: '🎨',
      isActive: true
    },
    {
      id: 8,
      name: 'Minuteur/Pomodoro',
      category: 'utility',
      description: 'Minuteur pour la technique Pomodoro',
      icon: '⏰',
      isActive: true
    }
  ]);

  const categories = [
    { id: 'all', label: 'Tous', count: tools.length },
    { id: 'calculator', label: 'Calculatrices', count: tools.filter(t => t.category === 'calculator').length },
    { id: 'converter', label: 'Convertisseurs', count: tools.filter(t => t.category === 'converter').length },
    { id: 'generator', label: 'Générateurs', count: tools.filter(t => t.category === 'generator').length },
    { id: 'utility', label: 'Utilitaires', count: tools.filter(t => t.category === 'utility').length }
  ];

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'calculator':
        return 'bg-blue-100 text-blue-800';
      case 'converter':
        return 'bg-green-100 text-green-800';
      case 'generator':
        return 'bg-purple-100 text-purple-800';
      case 'utility':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderToolContent = (tool: Tool) => {
    switch (tool.id) {
      case 1: // Calculatrice FCFA
        return <CalculatorFCFA />;
      case 2: // Convertisseur de devises
        return <CurrencyConverter />;
      case 3: // Générateur de mots de passe
        return <PasswordGenerator />;
      case 4: // Générateur de QR Code
        return <QRCodeGenerator />;
      case 5: // Calculatrice de pourcentages
        return <PercentageCalculator />;
      case 6: // Convertisseur d'unités
        return <UnitConverter />;
      case 7: // Générateur de couleurs
        return <ColorGenerator />;
      case 8: // Minuteur/Pomodoro
        return <PomodoroTimer />;
      default:
        return <div className="text-center text-gray-500">Outil en développement</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🛠️ Outils
        </h1>
        <p className="text-gray-600">
          Collection d'outils pratiques pour améliorer votre productivité
        </p>
      </div>

      {/* Navigation des catégories */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === category.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.label}
              {category.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Grille des outils */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveTool(tool)}
            className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{tool.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{tool.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{tool.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs ${tool.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {tool.isActive ? '✅ Disponible' : '⏸️ En maintenance'}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Utiliser →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de l'outil */}
      {activeTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{activeTool.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeTool.name}</h2>
                  <p className="text-sm text-gray-600">{activeTool.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="border-t pt-4">
              {renderToolContent(activeTool)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composants des outils
const CalculatorFCFA: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    if (previousValue === null) {
      setPreviousValue(parseFloat(display));
      setOperation(op);
      setDisplay('0');
    }
  };

  const calculate = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      let result = 0;
      
      switch (operation) {
        case '+':
          result = previousValue + current;
          break;
        case '-':
          result = previousValue - current;
          break;
        case '×':
          result = previousValue * current;
          break;
        case '÷':
          result = previousValue / current;
          break;
      }
      
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const formatFCFA = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(num);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 p-4 rounded-lg text-right">
        <div className="text-2xl font-mono">{formatFCFA(display)}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['C', '÷', '×', '⌫'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn === 'C' ? clear() : handleOperation(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-medium"
          >
            {btn}
          </button>
        ))}
        {['7', '8', '9', '-'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn === '-' ? handleOperation(btn) : handleNumber(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-medium"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '+'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn === '+' ? handleOperation(btn) : handleNumber(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-medium"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '='].map((btn) => (
          <button
            key={btn}
            onClick={() => btn === '=' ? calculate() : handleNumber(btn)}
            className={`p-3 rounded-lg font-medium ${
              btn === '=' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {btn}
          </button>
        ))}
        {['0', '.', '00'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleNumber(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-medium"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('XOF');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('1.52');

  const currencies = [
    { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dollar US', symbol: '$' },
    { code: 'GBP', name: 'Livre Sterling', symbol: '£' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {amount} {fromCurrency} = {result} {toCurrency}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Taux de change: 1 {fromCurrency} = {(parseFloat(result) / parseFloat(amount)).toFixed(4)} {toCurrency}
        </div>
      </div>
    </div>
  );
};

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-mono break-all">{password || 'Votre mot de passe apparaîtra ici'}</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longueur: {length}
          </label>
          <input
            type="range"
            min="4"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="mr-2"
            />
            Majuscules (A-Z)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="mr-2"
            />
            Minuscules (a-z)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="mr-2"
            />
            Chiffres (0-9)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="mr-2"
            />
            Symboles (!@#$%^&*)
          </label>
        </div>
        
        <button
          onClick={generatePassword}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Générer un mot de passe
        </button>
      </div>
    </div>
  );
};

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://ecosystia.senegel.org');
  const [qrCode, setQrCode] = useState('');

  const generateQR = () => {
    // Simulation d'un QR code (en réalité, utiliser une librairie comme qrcode.js)
    setQrCode('QR Code généré pour: ' + text);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Texte ou URL</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez le texte ou l'URL"
        />
      </div>
      
      <button
        onClick={generateQR}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Générer le QR Code
      </button>
      
      {qrCode && (
        <div className="text-center">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="text-gray-500">QR Code</div>
            <div className="text-sm mt-2">{qrCode}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const PercentageCalculator: React.FC = () => {
  const [value, setValue] = useState('100');
  const [percentage, setPercentage] = useState('10');
  const [result, setResult] = useState('10');

  const calculate = () => {
    const val = parseFloat(value);
    const perc = parseFloat(percentage);
    setResult(((val * perc) / 100).toString());
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pourcentage (%)</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Calculer
      </button>
      
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-900">
          {percentage}% de {value} = {result}
        </div>
      </div>
    </div>
  );
};

const UnitConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [result, setResult] = useState('100');

  const units = [
    { category: 'Longueur', units: [
      { code: 'm', name: 'Mètre', factor: 1 },
      { code: 'cm', name: 'Centimètre', factor: 0.01 },
      { code: 'mm', name: 'Millimètre', factor: 0.001 },
      { code: 'km', name: 'Kilomètre', factor: 1000 }
    ]}
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {units[0].units.map(unit => (
              <option key={unit.code} value={unit.code}>
                {unit.code} - {unit.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vers</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {units[0].units.map(unit => (
              <option key={unit.code} value={unit.code}>
                {unit.code} - {unit.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-900">
          {value} {fromUnit} = {result} {toUnit}
        </div>
      </div>
    </div>
  );
};

const ColorGenerator: React.FC = () => {
  const [colors, setColors] = useState<string[]>([]);

  const generateColors = () => {
    const newColors = [];
    for (let i = 0; i < 5; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      newColors.push(color);
    }
    setColors(newColors);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateColors}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Générer des couleurs
      </button>
      
      {colors.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color, index) => (
            <div key={index} className="text-center">
              <div
                className="w-full h-16 rounded-lg mb-2"
                style={{ backgroundColor: color }}
              ></div>
              <div className="text-xs font-mono">{color}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-600">
          {isBreak ? 'Pause' : 'Travail'}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={isRunning ? stopTimer : startTimer}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            isRunning ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isRunning ? 'Pause' : 'Démarrer'}
        </button>
        <button
          onClick={resetTimer}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        Technique Pomodoro: 25 min de travail, 5 min de pause
      </div>
    </div>
  );
};

export default Tools;
