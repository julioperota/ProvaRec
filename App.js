import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('jokes.db');

const JokeApp = () => {
  const [jokes, setJokes] = useState([]);
  const [selectedJoke, setSelectedJoke] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS jokes (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, setup TEXT, punchline TEXT)'
      );
    });
    retrieveJokes();
  }, []);

  const fetchRandomJoke = async () => {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      const data = await response.json();
      if (response.ok) {
        saveJoke(data);
        setJokes(prevJokes => [...prevJokes, data]);
      } else {
        setError('Error fetching joke data');
      }
    } catch (error) {
      setError('Error fetching joke data');
    }
  };

  const saveJoke = (joke) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO jokes (type, setup, punchline) VALUES (?, ?, ?)',
        [joke.type, joke.setup, joke.punchline]
      );
    });
  };

  const retrieveJokes = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM jokes', [], (_, { rows }) => {
        setJokes(rows._array);
      });
    });
  };

  const handleJokeSelection = (joke) => {
    setSelectedJoke(joke);
  };

  const renderJokeItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleJokeSelection(item)}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Type: {item.type}</Text>
        <Text style={styles.itemText}>Setup: {item.setup}</Text>
        <Text style={styles.itemText}>Punchline: {item.punchline}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSelectedJoke = () => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>Type: {selectedJoke.type}</Text>
      <Text style={styles.itemText}>Setup: {selectedJoke.setup}</Text>
      <Text style={styles.itemText}>Punchline: {selectedJoke.punchline}</Text>
    </View>
  );

  const clearScreen = () => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM jokes', [], () => {
        setJokes([]);
        setSelectedJoke(null);
        setError(null);
      });
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={fetchRandomJoke}>
        <Text style={styles.buttonText}>Get Joke</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={clearScreen}>
        <Text style={styles.buttonText}>Clear Screen</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={jokes}
        renderItem={renderJokeItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {selectedJoke && renderSelectedJoke()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#4DA6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  itemContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemText: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default JokeApp;

