import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

export const AndroidfileView = async (uri, name, headerObject) => {
  try {
    // Define the cache directory path
    const cacheDir = FileSystem.cacheDirectory + name;

    // Download the file to the cache directory
    const res = await FileSystem.downloadAsync(
      uri,
      cacheDir,
      { headers: headerObject }
    );

    // Get the content URI for the downloaded file
    const content = await FileSystem.getContentUriAsync(res.uri);

    // Start the activity to view the file
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: content.uri,  // Use content.uri to get the URI string
      flags: IntentLauncher.Intent.FLAG_GRANT_READ_URI_PERMISSION, // Grant read URI permission
      type: res.mimeType || 'application/octet-stream'  // Default to 'application/octet-stream' if mimeType is not available
    });
  } catch (e) {
    console.error("[ERROR] Intent launcher: ", e);
  }
};
