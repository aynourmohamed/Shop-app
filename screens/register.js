import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const Register = ({ navigation }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfrimpassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const background = theme === 'dark' ? '#161512' : '#f9f7f6';
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F';
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF';
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82';
  const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8';

  async function Signup() {
    if (!firstname || !lastname || !email || !password || !confirmpassword) {
      alert('Please fill all fields');
      return;
    }

    if (password !== confirmpassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { first_name: firstname, last_name: lastname }
      }
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigation.navigate('Tabnavigator');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* logo */}
        <Image
          source={require('../assets/images/logo no bg.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* title */}
        <Text style={[styles.title, { color: textColor }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: mutedText }]}>
          Join Luxe Éclat and start shopping
        </Text>

        {/* form card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {/* first + last name */}
          <View style={styles.row}>
            <View style={styles.halfwidth}>
              <Text style={[styles.fieldname, { color: mutedText }]}>First Name</Text>
              <View style={[styles.inputrow, { borderColor }]}>
                <TextInput
                  placeholder="First name"
                  placeholderTextColor={mutedText}
                  style={[styles.input, { color: textColor }]}
                  value={firstname}
                  onChangeText={setFirstname}
                />
              </View>
            </View>

            <View style={styles.halfwidth}>
              <Text style={[styles.fieldname, { color: mutedText }]}>Last Name</Text>
              <View style={[styles.inputrow, { borderColor }]}>
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor={mutedText}
                  style={[styles.input, { color: textColor }]}
                  value={lastname}
                  onChangeText={setLastname}
                />
              </View>
            </View>
          </View>

          {/* email */}
          <Text style={[styles.fieldname, { color: mutedText }]}>Email</Text>
          <View style={[styles.inputrow, { borderColor }]}>
            <Ionicons name="mail-outline" size={18} color={mutedText} />
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={mutedText}
              style={[styles.input, { color: textColor }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* password */}
          <Text style={[styles.fieldname, { color: mutedText }]}>Password</Text>
          <View style={[styles.inputrow, { borderColor }]}>
            <Ionicons name="lock-closed-outline" size={18} color={mutedText} />
            <TextInput
              placeholder="********"
              placeholderTextColor={mutedText}
              style={[styles.input, { color: textColor }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={mutedText}
              />
            </TouchableOpacity>
          </View>

          {/* confirm password */}
          <Text style={[styles.fieldname, { color: mutedText }]}>Confirm Password</Text>
          <View style={[styles.inputrow, { borderColor }]}>
            <Ionicons name="lock-closed-outline" size={18} color={mutedText} />
            <TextInput
              placeholder="********"
              placeholderTextColor={mutedText}
              style={[styles.input, { color: textColor }]}
              value={confirmpassword}
              onChangeText={setConfrimpassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={mutedText}
              />
            </TouchableOpacity>
          </View>

          {/* signup button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={Signup}
            disabled={loading}
          >
            <Text style={styles.buttontext}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* login link */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: mutedText }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerLink}> Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  logo: {
    width: 130,
    height: 85,
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  halfwidth: {
    flex: 1,
  },

  fieldname: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },

  inputrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  button: {
    backgroundColor: '#c2b5be',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttontext: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  registerText: {
    fontSize: 14,
  },

  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c2b5be',
  },
});