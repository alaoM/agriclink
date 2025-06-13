import React from 'react';
import { Image, View, StyleSheet, ScrollView } from 'react-native';

const PDFImageViewer = ({ imageUris }) => {
  // Ensure imageUris is always an array
  const uris = Array.isArray(imageUris) ? imageUris : [imageUris];

  return (
    <ScrollView style={styles.container}>
      {uris.map((uri, index) => (
        <Image key={index} source={{ uri }} style={styles.image} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 800, // Adjust height as needed
    resizeMode: 'contain',
  },
});

export default PDFImageViewer;
