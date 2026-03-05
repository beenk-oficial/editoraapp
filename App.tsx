import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const featuredBooks = [
  { id: '1', title: 'Book One', category: 'Fiction' },
  { id: '2', title: 'Book Two', category: 'Non-Fiction' },
  { id: '3', title: 'Book Three', category: 'Science' },
  // Add more books as needed
];

const HomeScreen = () => {
  const categories = [...new Set(featuredBooks.map(book => book.category))];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Books</Text>
      {categories.map(category => (
        <View key={category}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={featuredBooks.filter(book => book.category === category)}
            renderItem={({ item }) => <Text style={styles.bookTitle}>{item.title}</Text>}
            keyExtractor={item => item.id}
          />
        </View>
      ))}
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        {/* Add other screens here */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  bookTitle: {
    fontSize: 16,
    marginVertical: 5,
  },
});
