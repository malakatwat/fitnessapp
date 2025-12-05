import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, G, Line, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
  blue: '#3498db',
  red: '#e74c3c',
};

const screenWidth = Dimensions.get('window').width;
const chartPadding = 20; // Reduced padding slightly

// --- Mock Data ---
const dailyData = [
  { label: 'Mon', value: 2100 }, { label: 'Tue', value: 2300 }, { label: 'Wed', value: 2000 },
  { label: 'Thu', value: 2200 }, { label: 'Fri', value: 2150 }, { label: 'Sat', value: 2400 },
  { label: 'Sun', value: 2250 },
];
const weeklyData = [
  { label: 'W1', value: 15500 }, { label: 'W2', value: 16100 }, { label: 'W3', value: 15800 }, { label: 'W4', value: 16200 },
];
const monthlyData = [
  { label: 'Jan', value: 65000 }, { label: 'Feb', value: 68000 }, { label: 'Mar', value: 66000 }, { label: 'Apr', value: 70000 },
];
const weightData = [ { x: 0, y: 75 }, { x: 1, y: 74.5 }, { x: 2, y: 74 }, { x: 3, y: 73.8 }, { x: 4, y: 73.5 } ];
const macroData = [ { label: 'Protein', value: 150, color: theme.blue }, { label: 'Carbs', value: 250, color: theme.primary }, { label: 'Fat', value: 70, color: theme.red } ];

// --- Mock Bar Chart Component (Revised) ---
const MockBarChart = ({ data }: { data: { label: string, value: number }[] }) => { // Removed onBarPress prop for now
  const chartHeight = 200;
  const chartWidth = screenWidth - (chartPadding * 2);
  const chartContentHeight = chartHeight - 20;
  const dataLength = Math.max(data.length, 1);
  const barMarginRatio = 0.3;
  const totalBarAndMarginWidth = chartWidth / dataLength;
  const barWidth = Math.max(1, totalBarAndMarginWidth * (1 - barMarginRatio));
  const barMargin = totalBarAndMarginWidth * barMarginRatio;
  const maxValueInData = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const maxValue = Math.max(maxValueInData * 1.1, 1);

  return (
    <View style={styles.chartContainer}>
      <Svg height={chartHeight} width={chartWidth}>
        <G y={chartContentHeight}>
          {data.map((item, index) => {
            const barHeight = Math.max(0, (item.value / maxValue) * chartContentHeight);
            const barX = index * totalBarAndMarginWidth + barMargin / 2;
            return (
              // Temporarily removed the wrapping G, Pressable, and SvgText
              <Rect
                key={index} // Added key directly to Rect
                x={barX}
                y={-barHeight}
                width={barWidth}
                height={barHeight}
                fill={theme.primary}
                rx={4}
              />
            );
          })}
          {/* Goal line remains */}
          <Line
            x1={0}
            y1={-(2200 / maxValue) * chartContentHeight}
            x2={chartWidth}
            y2={-(2200 / maxValue) * chartContentHeight}
            stroke={theme.lightText}
            strokeWidth="1"
            strokeDasharray="4, 4"
          />
        </G>
      </Svg>
    </View>
  );
};

// --- Mock Line Chart Component (No changes needed here for now) ---
const MockLineChart = ({ data }: { data: { x: number, y: number }[] }) => {
    // ... (previous implementation)
    const chartHeight = 150;
    const chartWidth = screenWidth - (chartPadding * 2) - 40; // Less width to show axis labels idea
    const maxX = Math.max(...data.map(d => d.x), 1); // Avoid division by zero
    const maxY = Math.max(...data.map(d => d.y), 1);
    const minY = Math.min(...data.map(d => d.y));
    const rangeY = Math.max(maxY - minY, 1); // Avoid division by zero

    const points = data.map(p => 
        `${(p.x / maxX) * chartWidth},${chartHeight - ((p.y - minY) / rangeY) * chartHeight}`
    ).join(' ');

    return (
        <View style={styles.chartContainer}>
            <Svg height={chartHeight + 20} width={chartWidth + 40}>
                {/* Mock Y Axis */}
                <Line x1="30" y1="0" x2="30" y2={chartHeight} stroke={theme.grey} strokeWidth="1"/>
                <SvgText x="15" y={chartHeight/2} fill={theme.lightText} fontSize="10" textAnchor="middle">{((maxY+minY)/2).toFixed(1)}</SvgText>
                 <SvgText x="15" y={10} fill={theme.lightText} fontSize="10" textAnchor="middle">{maxY.toFixed(1)}</SvgText>
                 <SvgText x="15" y={chartHeight} fill={theme.lightText} fontSize="10" textAnchor="middle">{minY.toFixed(1)}</SvgText>
                {/* Mock X Axis */}
                <Line x1="30" y1={chartHeight} x2={chartWidth+30} y2={chartHeight} stroke={theme.grey} strokeWidth="1"/>
                
                <G x="30">
                    <Path d={`M${points}`} fill="none" stroke={theme.blue} strokeWidth="3" />
                    {data.map((p, index) => (
                        <Circle
                            key={index}
                            cx={(p.x / maxX) * chartWidth}
                            cy={chartHeight - ((p.y - minY) / rangeY) * chartHeight}
                            r="4"
                            fill={theme.blue}
                        />
                    ))}
                </G>
            </Svg>
        </View>
    );
};

// --- Mock Pie Chart Component (No changes needed here for now) ---
const MockPieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    // ... (previous implementation)
    const total = Math.max(data.reduce((sum, item) => sum + item.value, 0), 1); // Avoid division by zero
    let cumulativePercent = 0;

    return (
        <View style={styles.pieChartContainer}>
            <Svg height={150} width={150} viewBox="0 0 150 150">
                <G transform="translate(75, 75)">
                    {data.map((item, index) => {
                        const percent = (item.value / total);
                        if (percent === 0) return null; // Don't draw zero slices

                        const angle = percent * 360;
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const startAngleRad = Math.PI * (cumulativePercent * 360 - 90) / 180;
                        const endAngleRad = Math.PI * ((cumulativePercent + percent) * 360 - 90) / 180;

                        const startX = 70 * Math.cos(startAngleRad);
                        const startY = 70 * Math.sin(startAngleRad);
                        const endX = 70 * Math.cos(endAngleRad);
                        const endY = 70 * Math.sin(endAngleRad);
                        
                        cumulativePercent += percent;

                        // Ensure values are numbers for the path
                        const pathData = `M 0,0 L ${startX},${startY} A 70,70 0 ${largeArcFlag},1 ${endX},${endY} Z`;

                        return (
                            <Path 
                                key={index}
                                d={pathData}
                                fill={item.color}
                            />
                        );
                    })}
                </G>
            </Svg>
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColorBox, {backgroundColor: item.color}]} />
                        <Text style={styles.legendLabel}>{item.label} ({Math.round(item.value)}g)</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};


// --- Main Reports Screen (No structural changes needed) ---
export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedBarData, setSelectedBarData] = useState<{ label: string, value: number } | null>(null);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Weekly': return weeklyData;
      case 'Monthly': return monthlyData;
      case 'Daily':
      default: return dailyData;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)" asChild><TouchableOpacity><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity></Link>
        <Text style={styles.headerTitle}>My Reports</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Calorie Intake Section */}
        <Text style={styles.sectionTitle}>Calorie Intake (Simulated)</Text>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Daily' && styles.tabActive]} 
            onPress={() => setActiveTab('Daily')}>
            <Text style={[styles.tabText, activeTab === 'Daily' && styles.tabTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Weekly' && styles.tabActive]} 
            onPress={() => setActiveTab('Weekly')}>
            <Text style={[styles.tabText, activeTab === 'Weekly' && styles.tabTextActive]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Monthly' && styles.tabActive]} 
            onPress={() => setActiveTab('Monthly')}>
            <Text style={[styles.tabText, activeTab === 'Monthly' && styles.tabTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.chartTitle}>{activeTab} Calories</Text>
          {/* Pass only data, remove onBarPress */}
          <MockBarChart data={getCurrentData()} /> 
          {/* Keep this commented out for now */}
          {/* {selectedBarData && (
            <Text style={styles.selectedValueText}>
              {selectedBarData.label}: {selectedBarData.value} kcal
            </Text>
          )} */}
        </View>

        {/* Weight Trend Section */}
        <Text style={styles.sectionTitle}>Weight Trend (Simulated)</Text>
        <View style={styles.card}>
            <Text style={styles.chartTitle}>Last 5 Entries (kg)</Text>
            <MockLineChart data={weightData} />
        </View>

        {/* Macro Distribution Section */}
        <Text style={styles.sectionTitle}>Macro Distribution (Simulated)</Text>
        <View style={styles.card}>
             <Text style={styles.chartTitle}>Today's Macros</Text>
            <MockPieChart data={macroData} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Minor adjustments) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.grey },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.grey, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginVertical: 10, marginTop: 15 },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, backgroundColor: theme.grey, borderRadius: 20, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 18 },
  tabActive: { backgroundColor: theme.background, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tabText: { color: theme.lightText, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: theme.primary, fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: theme.background, borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 15 }, // Increased bottom margin
  chartContainer: { alignItems: 'center', justifyContent: 'center', width: '100%' }, // Ensure container takes width
  selectedValueText: { marginTop: 15, fontSize: 14, color: theme.primary, fontWeight: 'bold' }, // Increased top margin
  // Pie Chart Specific
  pieChartContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around'},
  legendContainer: { marginLeft: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  legendColorBox: { width: 12, height: 12, borderRadius: 3, marginRight: 8},
  legendLabel: { fontSize: 14, color: theme.text },
});