import { Animated, TextInput, StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator, StatusBar} from 'react-native';
import React, { useRef, useState, useEffect } from "react";
import { Ionicons } from "react-native-vector-icons";
import filter from "lodash.filter"
import BottomNavigator from '../../components/BottomNavigation';
import { parseDatePeriod } from '../../functions/Parsers';
import Tooltip from '../../components/Tooltip';


export default function MyClaimsScreen({ navigation }) {        

  window.localStorage.setItem('stackScreen', 'MyClaims');
  const userDetails = JSON.parse(window.localStorage.getItem('details'))

  const [data, setData] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [showTip, setTip] = useState(false);

  useEffect(() => {
    setIsLoading(true)
    fetchData()
    
  }, []);

  async function fetchData() {
    const email = window.localStorage.getItem('session');
    await fetch(`http://localhost:5000/myClaims/${email}`)
    .then((response) => response.json())
    .then((data) => {
      data = data.reverse()
      setFullData(data);
      setData(data);
    });
    setIsLoading(false);
  }
  
  
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('')

  const styles = StyleSheet.create({
    page: {
      height: "100%",
      width: "100%",
      minWidth: "330px",
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "Arial",
    },
    loadingPage: {
      position:'absolute',
      height:'100%',
      width:'100%',
      zIndex: isLoading ? 999 : -1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'black',
      opacity: isLoading ? '50%' : '0%'
    },
    pageDefault: {
      width: "100%",
      flexGrow:1,
      backgroundColor: '#fff',
      alignItems: 'center',
      flexDirection: "column",
    },
    bottomNavigation: {
      width:'100%',
      height: '70px'
    },
    topCard: {
      height: "130px",
      width:"100%",
      alignItems: "center",
      justifyContent: "flex-end",
      flexDirection: "column",
      borderBottomWidth: "2px",
      borderColor: "#DADADA"
    },

    text: {
      fontSize: "17px",
      fontWeight: "700",
      fontFamily: "inherit",
    },
    textInput: {
      height: "35px",
      width:'100%',
      color: "#6A6A6A",
      backgroundColor: "#D9D9D9",
      borderWidth: "1px",
      borderRadius: "12px",
      padding: "10px",
      borderColor: "#DADADA",
    },

    content: {
      width:"95%",
      flex:"1",
    },

    inputContainer: {
      paddingVertical:'5px',
      width:'85%',
      paddingBottom: "15px",
      flexDirection:'row-reverse'
    },
    defaultButton: {
      fontFamily: "inherit",
      backgroundColor: "#E04F4F",
      border: "none",
  
      padding: "10px",
      color: "white",
      textAlign: "center",
      fontSize: "16px",
      fontWeight: "700",
      
      height: "40px",
      borderRadius: "14px",
  
      cursor: "pointer"
    },
    userCard: {
      backgroundColor: 'white',
      height:"100px",
      padding: "10px",
      borderBottomWidth: "0.5px",
      borderTopWidth: "0.5px",
      borderColor: "#DADADA",
      flexDirection: "row",
      alignItems:"center"
    },

  });


  async function handleEditClaim () {

    for (var i = 0; i < data.length; i++) {
      if (data[i].id == selectedId) {
        console.log(data[i].id)
        navigation.navigate("EditClaimScreen", { props: data[i]})

      }
    }
  
  }

  function handleSearch (search) {
    setSearch(search)
    const formattedQuery = search.toLowerCase();
    const filteredData = filter(fullData, (claim)=> {
      return contains(claim, formattedQuery)
    })
    setData(filteredData)
    //console.log(filteredData)
  }

  const contains = ({form_creator}, query) => {
    console.log(form_creator)
    console.log(query)
    form_creator = form_creator.toLowerCase()
    if (form_creator.includes(query)) {
      return true
    }
    return false
  }
  
  const Item = ({date, creator_Name, total, claimees, status, claimId, expense_type, backgroundColor, transform, onPress, onMouseEnter, onMouseLeave}) => (
    <TouchableOpacity onPress={onPress} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={[styles.userCard,{backgroundColor},{transform}]}>
      <View style={{height:"100%", width:"10%", minWidth:"45px", alignItems: "center", justifyContent: "center"}}>
        {expense_type == 'Travel Claim' ? (
          <Tooltip text={'Travel claim'}>
            <Text><Ionicons  name="airplane-outline" color="#444" size="25px"/></Text>
          </Tooltip>
        ):(
          <Tooltip text={'Monthly Claim'}>
            <Text><Ionicons  name="calendar-outline" color="#444" size="25px"/></Text>
          </Tooltip>
        )}
      </View>

      <View style={{height:"100%", width:"50%", minWidth:"180px", justifyContent:"center"}}>
      <Text style={{fontSize: "16px", fontWeight:"700"}}>{date}</Text>
      <Text style={{color:"#444444", fontSize: "14px", marginLeft:"25px"}}>Creator: {creator_Name}</Text>
      <Text style={{color:"#444444", fontSize: "14px", marginLeft:"25px"}}>Claimees: {claimees}</Text>
      <Text style={{color:"#444444", fontSize: "14px", marginLeft:"25px"}}>Total: {total}</Text>
      </View>

      <View style={{flexGrow:1, height:'80%', flexDirection:'row-reverse' }}>
        <View style={{width:"20%"}}></View>
        <View style={{justifyContent:'space-between', alignItems:'center'}}>
          <Text style={{fontWeight:'500', fontSize: "15px", color:status=='In Progress' ? "#7B7B7B" : status=='Submitted' ? "#D18225" : status == 'Pending Next Approver' ? "#D18225" : status=='Approved' ? "green" : status=='Rejected' ? '#B82626' : '#4BA7C5'}}>{status}</Text>
          <Text style={{fontWeight:'600', color:"#444444", fontSize: "16px"}} >ID: {claimId}</Text>
        </View>
      </View>
      
    </TouchableOpacity>
  );


  const renderItem = ({item}) => {

    const backgroundColor = item.id === selectedId ? '#EEEEEE' : 'white';
    const transform = item.id === selectedId ? [{translateX: 2 }] : [{translateX: 0 }];

    const monthlyPeriod = parseDatePeriod(item.pay_period_from, item.pay_period_to)
    const travellingPeriod = parseDatePeriod(item.period_from, item.period_to)

    return (
      <Item 
        date={item.form_type == 'Travelling' ? travellingPeriod : monthlyPeriod} 
        creator_Name = {item.form_creator}
        total = {userDetails.email == item.form_creator ? '$' + (item.total_amount) : ('Hidden')}
        claimees = {item.claimees}
        status = {item.status}
        claimId = {item.id}
        expense_type = {item.form_type}


       onMouseEnter={() => setSelectedId(item.id)}
       onMouseLeave={() => setSelectedId('')}

        onPress={() => handleEditClaim()}
        backgroundColor={backgroundColor}
        transform={transform}
      />
    )
  }

  return (
    <View style={styles.page}>
      <View style={styles.loadingPage}>
        <ActivityIndicator size='large' color="#E04F4F" />
      </View>

      <View style={styles.pageDefault}>
        <View style={{height:'5%'}}></View>
        <View style={styles.topCard}>
        <View style={{width:'84%', flexGrow:1, flexDirection:'row', alignItems:'center'}}>
          <Text style={{fontFamily:"inherit", fontSize: "38px", fontWeight:"700"}}>My Claims</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.textInput}
            placeholder="Search" 
            value={search} 
            onChangeText={(search) => handleSearch(search)} 
            autoCapitalize="none" 
            autoCorrect={false} 
          />
          <View style={{height:'35px', width:'35px', position:'absolute', alignItems:'center', justifyContent:'center'}}>
          <Text style={{paddingRight:'10px'}}><Ionicons name="search-outline" color="#444" size='large'/></Text>
          </View>

        </View>
      </View>


      <View style={styles.content}>
      <FlatList
        style={{height:"0px"}}
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      </View>
      


      </View>

      <View style={styles.bottomNavigation}>
        <BottomNavigator navigation={navigation} />
      </View>

    </View>
    
  );
}
