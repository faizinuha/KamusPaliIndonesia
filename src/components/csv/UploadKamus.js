import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

let staticDictionary = [];
try {
  staticDictionary = require('../../data/dictionary').dictionary || [];
} catch (err) {
  console.warn('Tidak dapat memuat dictionary.js:', err);
  staticDictionary = [];
}

const DICTIONARY_KEY = '@dictionary_data';
const FILE_PATH = FileSystem.documentDirectory + 'dictionary.js';

const UploadKamus = ({ onBack, onDictionaryUpdate }) => {
  const [inputText, setInputText] = useState('');
  const [dictionaryData, setDictionaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadDictionaryData();
  }, []);

  const loadDictionaryData = async () => {
    try {
      const stored = await AsyncStorage.getItem(DICTIONARY_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setDictionaryData(data);
        setStatus(`Kamus dimuat: ${data.length} kata`);
      } else {
        await AsyncStorage.setItem(
          DICTIONARY_KEY,
          JSON.stringify(staticDictionary)
        );
        setDictionaryData(staticDictionary);
        setStatus(`Kamus statis dimuat: ${staticDictionary.length} kata`);
      }
    } catch (err) {
      console.error('Load error:', err);
      setStatus('Gagal memuat kamus');
    }
  };

  const validateJsonInput = (content) => {
    try {
      const parsed = JSON.parse(content);
      const isValid =
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            item.pali &&
            item.indonesia &&
            item.paliVerse &&
            item.detailedIndonesia
        );
      return {
        isValid,
        data: isValid ? parsed : [],
      };
    } catch {
      return { isValid: false, data: [] };
    }
  };

  const saveToFile = async (data) => {
    try {
      await FileSystem.writeAsStringAsync(
        FILE_PATH,
        JSON.stringify(data, null, 2)
      );
      console.log('File disimpan di:', FILE_PATH);
      Alert.alert('Sukses', `Kamus disimpan ke file:\n${FILE_PATH}`);
    } catch (err) {
      console.error('Gagal simpan file:', err);
      Alert.alert('Gagal', 'Tidak bisa menyimpan file kamus');
    }
  };

  const handleUpload = async () => {
    if (!inputText.trim()) {
      Alert.alert('Peringatan', 'Silakan masukkan data kamus terlebih dahulu');
      return;
    }

    const { isValid, data } = validateJsonInput(inputText);
    if (!isValid) {
      Alert.alert(
        'Format Tidak Valid',
        'Pastikan format JSON array dengan: pali, indonesia, paliVerse, detailedIndonesia'
      );
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Menyimpan data...');

      const existingWords = new Set(
        dictionaryData.map((item) => item.pali.toLowerCase())
      );
      const newWords = data.filter(
        (item) => !existingWords.has(item.pali.toLowerCase())
      );

      if (newWords.length === 0) {
        setIsLoading(false);
        Alert.alert('Info', 'Semua kata sudah ada. Tidak ada data baru.');
        return;
      }

      const updated = [
        ...dictionaryData,
        ...newWords.map((item, idx) => ({
          ...item,
          id: String(dictionaryData.length + idx + 1),
        })),
      ];

      await AsyncStorage.setItem(DICTIONARY_KEY, JSON.stringify(updated));
      await saveToFile(updated);

      setDictionaryData(updated);
      if (onDictionaryUpdate) onDictionaryUpdate(updated);
      if (global.updateDictionary) global.updateDictionary(updated);

      setStatus('Upload dan simpan berhasil!');
      Alert.alert(
        'Sukses',
        `${newWords.length} kata baru ditambahkan & disimpan`
      );
      setInputText('');
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error', 'Gagal menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleJson = () => {
    const sample = [
      {
        pali: 'abhi',
        indonesia: 'maju',
        paliVerse: 'abhi',
        detailedIndonesia: 'n. maju',
      },
      {
        pali: 'metta',
        indonesia: 'cinta kasih',
        paliVerse: 'metta',
        detailedIndonesia: 'n. cinta kasih',
      },
    ];
    setInputText(JSON.stringify(sample, null, 2));
    Alert.alert('Contoh Dimuat', 'Contoh data JSON berhasil dimuat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#4361ee" />
        </TouchableOpacity>
        <Text style={styles.title}>Welcome Admin....</Text>
      </View>

      <Text style={styles.infoText}>Input dalam format JSON array</Text>
      <Text style={styles.infoText}>Total kata: {dictionaryData.length}</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          <TextInput
            style={styles.input}
            multiline
            value={inputText}
            onChangeText={setInputText}
            placeholder="Paste data kamus dalam format JSON..."
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.button} onPress={loadSampleJson}>
            <FontAwesome5 name="clipboard" size={16} color="#4361ee" />
            <Text style={styles.buttonText}>Muat Contoh JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleUpload}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color="#fff" />
            <Text style={styles.buttonTextWhite}>Upload & Simpan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {status && <Text style={styles.statusText}>{status}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { marginRight: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4361ee' },
  infoText: { fontSize: 14, marginBottom: 4, color: '#666' },
  scroll: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
  },
  buttonText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  buttonTextWhite: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#4361ee',
  },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
});

export default UploadKamus;
