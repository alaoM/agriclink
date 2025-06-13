import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';

// Define the WebViewComponent
const WebViewComponent = ({ url, docName, headerObject }) => {

  const shareDoc = async () => {
    try {
      // Define the cache directory path
      const cacheDir = FileSystem.cacheDirectory + docName;

      // Download the file to the cache directory
      const res = await FileSystem.downloadAsync(
        url,
        cacheDir,
        { headers: headerObject }
      );

      // Share the downloaded file
      await Sharing.shareAsync(res.uri, {
        mimeType: res.mimeType || 'application/octet-stream',
        UTI: res.mimeType || 'public.data'  // Fallback to 'public.data' if mimeType is not available
      });
    } catch (e) {
      console.error("[ERROR] document", JSON.stringify(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={shareDoc}>
        <Text>Share</Text>
      </Pressable>
      <WebView
        style={{ flex: 1 }}
        source={{ uri: url, headers: headerObject }}
        scalesPageToFit={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator color='black' size='large' />
        )}
      />
    </View>
  );
};

// Define the iosWebView function
const IosWebView = (url, docName, headerObject) => {
  return <WebViewComponent url={url} docName={docName} headerObject={headerObject} />;
};

export default IosWebView;
