import {useColorScheme} from 'react-native';
import { createContext, useContext, useState } from 'react';
import { useBatteryLevel } from 'expo-battery'




const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    // detect device theme (light/dark)
    const deviceTheme = useColorScheme(); 

    // default theme
    const [theme, setTheme] = useState(deviceTheme || 'light'); 
    
    // toggle to choose light or dark mode
    const toggleTheme = () => {
        setTheme (theme === 'dark' ? 'light' : 'dark');
    }

    const batteryLevel = useBatteryLevel();
    console.log('Battery level:', batteryLevel);
    const isLowBattery = batteryLevel !== null &&
    batteryLevel !== -1 &&
    batteryLevel < 0.2;
    
    const [selectedcurrency, setSelectedcurrency] = useState('USD')
    const [selectedlanguage, setSelectedlanguage] = useState('en')


return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme,
        isLowBattery,
        selectedcurrency,
        setSelectedcurrency,
        selectedlanguage,
        setSelectedlanguage,
      }}>
      {children}
      
      
    </ThemeContext.Provider>
    

    
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}