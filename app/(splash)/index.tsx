import { AppText } from '@/components/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Splash1() {
  const {  token } = useAuth(); 
   useEffect(() => {
    const timer = setTimeout(() => token? router.replace('/settings') : router.replace('/login'), 3000);
    return () => clearTimeout(timer);
  }, [token]);  

  return (
    <View style={styles.container}>
      {/* Centered logo and title */}
      <View style={styles.centerContent}>
        <Image source={require('../../assets/images/adaptive-icon.png')} style={styles.logo} />
        <AppText style={styles.title}>AgricLink</AppText>
      </View>

      {/* Footer - Partner logos */}
      <View style={styles.brandContainer}>
        <AppText style={styles.brand}>Powered by</AppText>
        <View style={styles.brandlogos}>
          <Image source={require('../../assets/patners/armti.png') } resizeMode='contain' style={styles.partnerLogo} />
          <Image source={require('../../assets/patners/col.png')} resizeMode='contain' style={styles.colpartnerLogo} />
          <Image source={require('../../assets/patners/oau.png')} resizeMode='contain' style={styles.partnerLogo} />
        
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    // resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
  },
  brandContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  brandlogos: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 4,
  },
  colpartnerLogo:{width: 90,
    height: 90,
    // resizeMode: 'contain',
    marginHorizontal: 5,},
  partnerLogo: {
    width: 70,
    height: 70,
    // resizeMode: 'contain',
    marginHorizontal: 5,
  },
  brand: {
    fontSize: 18,
    fontWeight: '500',
    color: 'green',
  },
});
