import { AppText } from '@/components/AppText';
import { useState, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
  Animated,
  Dimensions
} from 'react-native';

// Status bar height adjustment for Android
const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24) + 8
  : 16;

const { width } = Dimensions.get('window');

// Mock data for market prices
interface MarketItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Livestock' | 'Dairy';
  price: number;
  unit: string;
  priceChange: number;
  lastUpdated: string;
  image: string;
}

const MOCK_MARKET_DATA: MarketItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    category: 'Vegetables',
    price: 2.50,
    unit: 'kg',
    priceChange: 0.15,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '2',
    name: 'Apples',
    category: 'Fruits',
    price: 3.25,
    unit: 'kg',
    priceChange: -0.10,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '3',
    name: 'Corn',
    category: 'Grains',
    price: 1.75,
    unit: 'kg',
    priceChange: 0.05,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '4',
    name: 'Chicken',
    category: 'Livestock',
    price: 5.50,
    unit: 'kg',
    priceChange: 0.25,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '5',
    name: 'Milk',
    category: 'Dairy',
    price: 1.20,
    unit: 'liter',
    priceChange: -0.05,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '6',
    name: 'Potatoes',
    category: 'Vegetables',
    price: 1.80,
    unit: 'kg',
    priceChange: 0.10,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '7',
    name: 'Oranges',
    category: 'Fruits',
    price: 2.75,
    unit: 'kg',
    priceChange: 0.20,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  },
  {
    id: '8',
    name: 'Rice',
    category: 'Grains',
    price: 2.20,
    unit: 'kg',
    priceChange: -0.15,
    lastUpdated: '2024-03-15',
    image: 'https://via.placeholder.com/100'
  }
];

export default function MarketplaceScreen() {
  const [marketData, setMarketData] = useState<MarketItem[]>(MOCK_MARKET_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Filter market data based on search query and selected category
  const filteredMarketData = marketData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Simulate refreshing data
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // In a real app, you would fetch fresh data here
      setRefreshing(false);
    }, 1500);
  };

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  // Handle opening the details modal
  const handleViewDetails = (item: MarketItem) => {
    setSelectedItem(item);
    setDetailsModalVisible(true);
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    // Reset selected item after animation completes
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Sticky header background that appears on scroll */}
      <Animated.View 
        style={[styles.stickyHeaderBg, { opacity: headerOpacity }]} 
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.header}>
          <AppText style={styles.heading}>Marketplace</AppText>
          <AppText style={styles.subheading}>Latest market prices for agricultural products</AppText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryFilters}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.activeCategoryChip]}
            onPress={() => setSelectedCategory(null)}
          >
            <AppText style={[styles.categoryChipText, !selectedCategory && styles.activeCategoryChipText]}>All</AppText>
          </TouchableOpacity>
          {['Vegetables', 'Fruits', 'Grains', 'Livestock', 'Dairy'].map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, selectedCategory === category && styles.activeCategoryChip]}
              onPress={() => setSelectedCategory(category)}
            >
              <AppText style={[styles.categoryChipText, selectedCategory === category && styles.activeCategoryChipText]}>{category}</AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Market Price Cards */}
        <View style={styles.marketItemsContainer}>
          {filteredMarketData.length > 0 ? (
            filteredMarketData.map(item => (
              <View key={item.id} style={styles.marketItemCard}>
                <View style={styles.marketItemHeader}>
                  <Image source={{ uri: item.image }} style={styles.marketItemImage} />
                  <View style={styles.marketItemInfo}>
                    <AppText style={styles.marketItemName}>{item.name}</AppText>
                    <View style={[styles.categoryTag, styles[`${item.category.toLowerCase()}Tag` as keyof typeof styles]]}>
                      <AppText style={styles.categoryTagText}>{item.category}</AppText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.marketItemDetails}>
                  <View style={styles.priceContainer}>
                    <AppText style={styles.priceLabel}>Current Price</AppText>
                    <AppText style={styles.priceValue}>${item.price.toFixed(2)}/{item.unit}</AppText>
                  </View>
                  
                  <View style={styles.priceChangeContainer}>
                    <AppText style={styles.priceChangeLabel}>Change</AppText>
                    <View style={styles.priceChangeValueContainer}>
                      <AppText 
                        style={[
                          styles.priceChangeValue, 
                          item.priceChange > 0 ? styles.priceIncrease : 
                          item.priceChange < 0 ? styles.priceDecrease : 
                          styles.priceUnchanged
                        ]}
                      >
                        {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}
                      </AppText>
                      <View 
                        style={[
                          styles.priceChangeIndicator,
                          item.priceChange > 0 ? styles.priceIncreaseIndicator : 
                          item.priceChange < 0 ? styles.priceDecreaseIndicator : 
                          styles.priceUnchangedIndicator
                        ]}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.marketItemFooter}>
                  <AppText style={styles.lastUpdated}>Last updated: {item.lastUpdated}</AppText>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => handleViewDetails(item)}
                  >
                    <AppText style={styles.detailsButtonText}>View Details</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <AppText style={styles.noResultsText}>No products found</AppText>
              <AppText style={styles.noResultsSubtext}>Try adjusting your search or filters</AppText>
            </View>
          )}
        </View>

        {/* Market Insights Section */}
        <View style={styles.insightsContainer}>
          <AppText style={styles.insightsTitle}>Market Insights</AppText>
          <View style={styles.insightCard}>
            <AppText style={styles.insightCardTitle}>Price Trends</AppText>
            <AppText style={styles.insightCardText}>
              Vegetable prices have increased by an average of 5% this week due to seasonal changes.
              Grain prices remain stable with minimal fluctuations.
            </AppText>
          </View>
          <View style={styles.insightCard}>
            <AppText style={styles.insightCardTitle}>Market Forecast</AppText>
            <AppText style={styles.insightCardText}>
              Fruit prices are expected to decrease in the coming weeks as the harvest season approaches.
              Livestock prices may see a slight increase due to increased demand.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Details Modal */}
      {detailsModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1} 
            onPress={handleCloseDetails}
          />
          <Animated.View style={styles.modalContainer}>
            {selectedItem && (
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <AppText style={styles.modalTitle}>{selectedItem.name}</AppText>
                  <TouchableOpacity onPress={handleCloseDetails} style={styles.closeButton}>
                    <AppText style={styles.closeButtonText}>×</AppText>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollContent}>
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={{ uri: selectedItem.image }} 
                      style={styles.modalImage} 
                      resizeMode="cover"
                    />
                    <View style={[styles.categoryTag, styles[`${selectedItem.category.toLowerCase()}Tag` as keyof typeof styles], styles.modalCategoryTag]}>
                      <AppText style={styles.categoryTagText}>{selectedItem.category}</AppText>
                    </View>
                  </View>

                  <View style={styles.modalPriceSection}>
                    <View style={styles.modalPriceContainer}>
                      <AppText style={styles.modalPriceLabel}>Current Price</AppText>
                      <AppText style={styles.modalPriceValue}>
                        ${selectedItem.price.toFixed(2)}/{selectedItem.unit}
                      </AppText>
                    </View>
                    
                    <View style={styles.modalPriceChangeContainer}>
                      <AppText style={styles.modalPriceChangeLabel}>Price Change</AppText>
                      <View style={styles.priceChangeValueContainer}>
                        <AppText 
                          style={[
                            styles.modalPriceChangeValue, 
                            selectedItem.priceChange > 0 ? styles.priceIncrease : 
                            selectedItem.priceChange < 0 ? styles.priceDecrease : 
                            styles.priceUnchanged
                          ]}
                        >
                          {selectedItem.priceChange > 0 ? '+' : ''}{selectedItem.priceChange.toFixed(2)}
                        </AppText>
                        <View 
                          style={[
                            styles.priceChangeIndicator,
                            selectedItem.priceChange > 0 ? styles.priceIncreaseIndicator : 
                            selectedItem.priceChange < 0 ? styles.priceDecreaseIndicator : 
                            styles.priceUnchangedIndicator
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalDetailsSection}>
                    <AppText style={styles.modalSectionTitle}>Market Details</AppText>
                    <View style={styles.modalDetailRow}>
                      <AppText style={styles.modalDetailLabel}>Last Updated:</AppText>
                      <AppText style={styles.modalDetailValue}>{selectedItem.lastUpdated}</AppText>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <AppText style={styles.modalDetailLabel}>Market Trend:</AppText>
                      <AppText 
                        style={[
                          styles.modalDetailValue,
                          selectedItem.priceChange > 0 ? styles.priceIncrease : 
                          selectedItem.priceChange < 0 ? styles.priceDecrease : 
                          styles.priceUnchanged
                        ]}
                      >
                        {selectedItem.priceChange > 0 ? 'Rising' : 
                         selectedItem.priceChange < 0 ? 'Falling' : 'Stable'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.modalHistorySection}>
                    <AppText style={styles.modalSectionTitle}>Price History</AppText>
                    <AppText style={styles.modalHistoryText}>
                      Historical price data would be displayed here in a real application.
                      This could include a chart showing price trends over time.
                    </AppText>
                  </View>

                  <View style={styles.modalMarketInsights}>
                    <AppText style={styles.modalSectionTitle}>Market Insights</AppText>
                    <AppText style={styles.modalInsightText}>
                      {selectedItem.category === 'Vegetables' && 
                        "Vegetable prices have increased by an average of 5% this week due to seasonal changes."}
                      {selectedItem.category === 'Fruits' && 
                        "Fruit prices are expected to decrease in the coming weeks as the harvest season approaches."}
                      {selectedItem.category === 'Grains' && 
                        "Grain prices remain stable with minimal fluctuations expected in the near future."}
                      {selectedItem.category === 'Livestock' && 
                        "Livestock prices may see a slight increase due to increased demand in the coming months."}
                      {selectedItem.category === 'Dairy' && 
                        "Dairy prices have been fluctuating due to changes in supply chain and seasonal factors."}
                    </AppText>
                  </View>

                  <View style={styles.modalActionSection}>
                    <TouchableOpacity style={styles.modalActionButton}>
                      <AppText style={styles.modalActionButtonText}>Set Price Alert</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalActionButton}>
                      <AppText style={styles.modalActionButtonText}>Share Price Info</AppText>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const CARD_RAD = 16;
const BACKDROP = '#fff';
const PRIMARY_COLOR = '#4CAF50';
const PRIMARY_LIGHT = '#EAF8E5';
const PRIMARY_BORDER = '#D1EFD1';

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: BACKDROP,
    paddingTop: STATUS_TOP 
  },
  scroll: { 
    flexGrow: 1, 
    padding: 16, 
    paddingBottom: 60 
  },
  stickyHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60 + STATUS_TOP,
    backgroundColor: BACKDROP,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    marginBottom: 24,
  },
  heading: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#2C3E50',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryFilters: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activeCategoryChip: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  marketItemsContainer: {
    marginBottom: 24,
  },
  marketItemCard: {
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
    borderRadius: CARD_RAD,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  marketItemHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  marketItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  marketItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  marketItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  vegetablesTag: {
    backgroundColor: '#E8F5E9',
  },
  fruitsTag: {
    backgroundColor: '#FFF3E0',
  },
  grainsTag: {
    backgroundColor: '#E3F2FD',
  },
  livestockTag: {
    backgroundColor: '#F3E5F5',
  },
  dairyTag: {
    backgroundColor: '#E0F7FA',
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495E',
  },
  marketItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
  },
  priceChangeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceChangeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  priceChangeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeValue: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  priceIncrease: {
    color: '#4CAF50',
  },
  priceDecrease: {
    color: '#F44336',
  },
  priceUnchanged: {
    color: '#7F8C8D',
  },
  priceChangeIndicator: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  priceIncreaseIndicator: {
    borderBottomColor: '#4CAF50',
    transform: [{ rotate: '0deg' }],
  },
  priceDecreaseIndicator: {
    borderBottomColor: '#F44336',
    transform: [{ rotate: '180deg' }],
  },
  priceUnchangedIndicator: {
    width: 10,
    height: 2,
    backgroundColor: '#7F8C8D',
    borderWidth: 0,
  },
  marketItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RAD,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  insightCardText: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: BACKDROP,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalContent: {
    padding: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7F8C8D',
    lineHeight: 28,
  },
  modalScrollContent: {
    padding: 16,
  },
  modalImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  modalCategoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  modalPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRIMARY_BORDER,
  },
  modalPriceContainer: {
    flex: 1,
  },
  modalPriceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  modalPriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  modalPriceChangeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalPriceChangeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  modalPriceChangeValue: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  modalDetailsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  modalDetailLabel: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalHistorySection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  modalHistoryText: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
  },
  modalMarketInsights: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  modalInsightText: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
  },
  modalActionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});