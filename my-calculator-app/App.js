import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const App = () => {
  const [currentNumber, setCurrentNumber] = useState('');
  const [lastNumber, setLastNumber] = useState('');
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(Dimensions.get('window').width > Dimensions.get('window').height);
    };

    Dimensions.addEventListener('change', updateOrientation);
    return () => {
      Dimensions.removeEventListener('change', updateOrientation);
    };
  }, []);

  const conversionRates = {
    USD: 0.0261,
    EUR: 0.0240,
    PLN: 0.1047,
  };

  function calculator() {
    let result = currentNumber;
    try {
      result = eval(currentNumber);
    } catch (e) {
      result = 'Error';
    }
    setCurrentNumber(result.toString());
  }

  function handleInput(buttonPressed) {
    if (buttonPressed === 'AC') {
      setCurrentNumber('');
      setLastNumber('');
    } else if (buttonPressed === 'DEL') {
      setCurrentNumber(currentNumber.substring(0, currentNumber.length - 1));
    } else if (buttonPressed === '=') {
      if (currentNumber === '') {
        return;
      }
      setLastNumber(currentNumber + ' = ');
      calculator();
    } else if (['USD', 'EUR', 'PLN'].includes(buttonPressed)) {
      if (currentNumber === '') {
        return;
      }
      const convertedValue = parseFloat(currentNumber) * conversionRates[buttonPressed];
      setCurrentNumber(`${convertedValue.toFixed(2)}`);
      setLastNumber(`${currentNumber} UAH -> ${buttonPressed} = `);
    } else if (['+', '-', '*', '/'].includes(buttonPressed)) {
      const operators = ['+', '-', '*', '/'];
      const lastChar = currentNumber.slice(-1);
  
      if (currentNumber === '') {
        return; // Не дозволяємо вводити оператори без чисел
      }
  
      if (operators.includes(lastChar)) {
        // Дозволяємо міняти оператори між собою
        setCurrentNumber(currentNumber.slice(0, -1) + buttonPressed);
      } else if (lastChar !== '.') {
        // Додаємо оператор до кінця введення, за умови, що перед ним не стоїть крапка
        setCurrentNumber(currentNumber + buttonPressed);
      }
    } else {
      if (isInvalidInput(buttonPressed)) {
        return;
      }
      const lastChar = currentNumber.slice(-1);
  
      if (lastChar === '.' && ['+', '-', '*', '/'].includes(buttonPressed)) {
        // Забороняємо вставляти оператори після крапки
        return;
      }
  
      if (['+', '-', '*', '/'].includes(lastChar) && buttonPressed === '.') {
        // Забороняємо вставляти крапку після операторів
        return;
      }
  
      // Додати оператор "=" до обробки
      if (currentNumber !== '' && buttonPressed !== '=') {
        setCurrentNumber(updateCurrentNumber(currentNumber, buttonPressed));
      } else if (buttonPressed !== '=') {
        // Якщо натиснуто будь-який оператор перед будь-яким числом, то додати його до введення
        setCurrentNumber(updateCurrentNumber(currentNumber, buttonPressed));
      }
    }
  }
  
  
  
  
  
  function isInvalidInput(buttonPressed) {
    if (buttonPressed === '.') {
      // Розділяємо введення на компоненти (числа)
      const parts = currentNumber.split(/[\+\-\*\/]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return true; // Забороняємо вводити крапку, якщо вона вже є в останньому числі
      }
    }
    return false;
  }

  function updateCurrentNumber(currentNum, newInput) {
    const operators = ['+', '-', '*', '/'];
    const lastChar = currentNum.slice(-1);
  
    // Перевірка, чи оператори вже були додані
    if (operators.includes(lastChar) && operators.includes(newInput)) {
      return currentNum; // Не додавати новий оператор, якщо обидва оператори вже є
    }
  
    // Перевірка, чи не додавається кілька точок у числі
    if (newInput === '.') {
      const parts = currentNum.split(/[\+\-\*\/]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return currentNum;
      }
    }
  
    // Забороняємо кілька нулів на початку
    if (newInput === '0' && currentNum === '0') {
      return currentNum;
    }
  
    // Забороняємо крапку без попередньої цифри
    if (newInput === '.' && currentNum === '') {
      return currentNum;
    }
  
    return currentNum + newInput;
  }

  const renderPortraitButtons = () => {
    const buttons = [
      'AC', 'DEL', '/', '*', 7, 8, 9, '-', 4, 5, 6, '+', 1, 2, 3, '0', '.', '='
    ];
    return buttons.map((button, index) => (
      <TouchableOpacity
        key={index.toString()}
        style={[
          styles.button,
          button === '=' ? styles.equalsButton : {},
          ['/', '*', '-', '+', 'AC', 'DEL'].includes(button) ? styles.operatorButton : {}
        ]}
        onPress={() => handleInput(button.toString())}>
        <Text style={styles.text}>{button}</Text>
      </TouchableOpacity>
    ));
  };

  const renderLandscapeButtons = () => {
    const buttons = ['USD', 'EUR', 'PLN'];
    return buttons.map((currency, index) => (
      <TouchableOpacity
        key={currency}
        style={[styles.button, styles.currencyButton]}
        onPress={() => handleInput(currency)}>
        <Text style={styles.text}>{currency}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultView}>
        <Text style={styles.historyText}>{lastNumber}</Text>
        <Text style={styles.resultText}>{currentNumber}</Text>
      </View>
      <View style={styles.buttons}>
        {isLandscape ? renderLandscapeButtons() : renderPortraitButtons()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
  },
  resultView: {
    flex: 2,
    backgroundColor: '#202020',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingLeft: 20,
  },
  historyText: {
    color: '#7c7c7c',
    fontSize: 20,
    marginBottom: 10,
    alignSelf: 'stretch',
    textAlign: 'right',
  },
  resultText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    alignSelf: 'stretch',
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#303030',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: Dimensions.get('window').width / 4 - 10,
    minHeight: Dimensions.get('window').width / 4 - 10,
    flex: 2,
    margin: 5,
    borderRadius: Dimensions.get('window').width / 8,
  },
  operatorButton: {
    backgroundColor: '#ff9500',
  },
  equalsButton: {
    backgroundColor: '#2ecc71',
  },
  operatorText: {
    color: '#fff',
    fontSize: 28,
  },
  text: {
    color: '#fff',
    fontSize: 28,
  },
  currencyButton: {
    backgroundColor: '#007aff',
  },
});

export default App;
