import { TextInput, StyleSheet, Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';
import React, { useState } from "react";
import { Ionicons, Feather } from "react-native-vector-icons";
import { SelectList } from 'react-native-dropdown-select-list'
import ConfirmationButton from '../../components/ConfirmationButton';
import * as ImagePicker from 'expo-image-picker';
import FullScreenImage from '../../components/FullScreenImage';
import BackButton from '../../components/BackButton';
import DefaultButton from '../../components/DefaultButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../components/custom-datepicker.css";

export default function EditTravelExpenseScreen({ navigation, route }) {        
  const [isExpand, setIsExpand] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteButtonHover, setIsDeleteButtonHover] = useState(false);
  const expenseDetails = route.params.expense
  const date = new Date(expenseDetails.date_of_expense)
  const expenseTypeDropdown = route.params.travellingExpenseTypes
  const [expense, setNewExpense] = useState({id: expenseDetails.id, claimee: expenseDetails.email,
    item_number: expenseDetails.item_number, type: expenseDetails.expense_type, otherType: null, date: date,
    amount: expenseDetails.total_amount, description: expenseDetails.description, receipt: expenseDetails.receipt});

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    setNewExpense({...expense, receipt: null})
  }

  function updateExpense(expense) {
    const header = {'Content-Type': 'application/json' };
    fetch('http://10.0.1.28:5000/editTravellingExpense', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(expense)})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.message == "Expense updated!") {
              alert("Expense updated!")
              navigation.goBack();
            } else {
              alert("Failed to update expense!")
            }
          })
  }

  function deleteExpense(expense) {
    const header = {'Content-Type': 'application/json' };
    fetch('http://10.0.1.28:5000/deleteExpense', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(expense)})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.message == "Expense deleted!") {
              alert("Expense deleted!")
              navigation.goBack();
            } else {
              alert("Failed to delete expense!")
            }
            })
  }

  function handleToggleEdit () {
    if (isEditing) {
      setNewExpense({id: expenseDetails.id, claimee: expenseDetails.email,
      item_number: expenseDetails.item_number, type: expenseDetails.expense_type, otherType: null, date: date,
      amount: expenseDetails.total_amount, description: expenseDetails.description, receipt: expenseDetails.receipt});
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  return (
    <View style={styles.page}>
      <FullScreenImage image={expense.receipt} myFunction={()=>{isExpand ? setIsExpand(false) : setIsExpand(true)}} show={isExpand}/>
        <View style={styles.pageDefault}>

          <View style={styles.topCard}>
            <View style={styles.backButtonBar}>
              <BackButton onPress={() => navigation.goBack()}/>
              {isEditing ? (
                <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onMouseEnter={() => setIsDeleteButtonHover(true)} onMouseLeave={() => setIsDeleteButtonHover(false)} 
                  onPress={() => ConfirmationButton('Are you sure you want to delete this expense?', 'Click ok to confirm deletion.', () => deleteExpense(expense))}>
                  <View style={styles.deleteButton}>
                    {isDeleteButtonHover?(
                      <Feather name="trash-2" color="#9C2424" size="27px"/>
                    ):(
                      <Feather name="trash" color="#9C2424" size="25px"/>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View/>
              )}
            </View>
          </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} style={{height:"0px"}}>
          <View style={{width:"100%", alignItems:"center"}}>
            <View style={styles.headerBar}>
              <View style={{paddingHorizontal: '7px'}}>
                <Text style={styles.bigText}>Travel</Text>
              </View>
              <View style={{paddingHorizontal: '7px'}}>
                <Text style={styles.bigText}>Expense</Text>
              </View>
            </View>
          </View>
          <View style={{padding:"15px",width:'100%', flex:"1", alignItems:'center', justifyContent:'center'}}>
          {isEditing ? (
            <View style={[styles.inputContainer,{zIndex:5}]}>
              <Text style={styles.normalBoldText}>Expense Type</Text>
              <SelectList
                dropdownStyles={styles.dropdownStyles}
                dropdownItemStyles={styles.dropdownItemStyles}
                dropdownTextStyles={styles.dropdownTextStyles}
                boxStyles={styles.boxStyles}
                inputStyles={styles.inputStyles}
                setSelected={(type) => setNewExpense({...expense, type: type})}
                data={expenseTypeDropdown}
                placeholder = {expense.type}
                save="value"
                showsVerticalScrollIndicator = {false}
                search = {false}
              />  
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.normalBoldText}>Expense Type</Text>
              <TextInput style={styles.textInput}
                placeholder="eg. Overtime meal"
                value={expense.type}
                autoCapitalize="none"
                autoCorrect={false}
                editable={isEditing}
              />
              </View>
          )}
          {expense.type == 'Others' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.normalBoldText}>If others, state type</Text>
              <TextInput style={styles.textInput}
                placeholder="eg. Overtime meal"
                onChangeText={(type) => setNewExpense({...expense, otherType: type})}
                autoCapitalize="none"
                autoCorrect={false}
                editable={isEditing}
              />
            </View>
          ) : (
            <View/>
          )}
            <View style={[styles.inputContainer, {zIndex:4}]}>
              <Text style={styles.normalBoldText}>Date</Text>
              <DatePicker 
                className="custom-input" 
                selected={expense.date} 
                onChange={(date) => setNewExpense({...expense, date: date})} 
                readOnly={!isEditing}  
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.normalBoldText}>Amount</Text>
              <TextInput style={styles.textInput}
                placeholder="eg. 20.34"
                value={expense.amount}
                onChangeText={(amount) => setNewExpense({...expense, amount: amount})}
                autoCapitalize="none"
                autoCorrect={false}
                editable={isEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.normalBoldText}>Description</Text>
              <TextInput style={[styles.textInput,{height:'100px'}]}
                placeholder="Description of expense"
                value={expense.description == null ? "" : expense.description}
                multiline={true}
                onChangeText={(description) => setNewExpense({...expense, description: description})}
                autoCapitalize="none"
                autoCorrect={false}
                editable={isEditing}
              />
            </View>
            {isEditing ? (
              <View style={styles.inputContainer}>
                <Text style={styles.normalBoldText}>Receipt</Text>
                <TouchableOpacity onPress={()=> pickImage()}>
                  <Image style={styles.receiptImage}
                    source={expense.receipt}
                  />
                  <View style={[styles.imageInput]}>
                    <Ionicons name="images-outline" color="#444444" size='25px'/>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.normalBoldText}>Receipt</Text>
                <TouchableOpacity onPress={()=>isExpand ? setIsExpand(false) : setIsExpand(true)}>
                  <Image style={styles.receiptImage}
                      source={expense.receipt}
                    />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      
      {route.params.claimStatus == 'In Progress' || route.params.claimStatus == 'Rejected' ? (
        <View style={styles.bottomCard}>
          {isEditing ? (
            <View style={{maxWidth:"500px" ,minWidth:"290px" ,width:"80%" ,flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
              <View style={styles.buttonContainer}>
                <DefaultButton description='Cancel' onPress = {() => ConfirmationButton('Are you sure you want to cancel?', 'Changes will be reverted', handleToggleEdit())} customStyle={{width: "90%", maxWidth: "400px"}}/>
              </View>
              <View style={styles.buttonContainer}>
                <DefaultButton description='Save' onPress = {() => ConfirmationButton('Are you sure you want to save these changes?', 'Expense details will be updated', () => updateExpense(expense))} customStyle={{width: "90%", maxWidth: "400px"}} buttonColor={"#45B097"}/>
              </View>
            </View>
          ) : (
            <View style={{maxWidth:"500px" ,minWidth:"290px" ,width:"80%" ,flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
              <View style={[styles.buttonContainer,{width:'100%'}]}>
                <DefaultButton description='Edit' onPress = {() => handleToggleEdit()} customStyle={{width: "90%", maxWidth: "400px"}} buttonColor={"#45B097"}/>
              </View>
            </View>
          )}
        </View>
        ) : (
          <View/>
        )}
      </View>
    </View>
  );
}

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
  pageDefault: {
    width: "100%",
    height: "90%",
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: "column",
  },
  topCard: {
    height: "70px",
    width:"100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  headerBar: {
    height: '95px',
    width:'60%',
    flexWrap:'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:'center',
    },
  bigText: {
    fontSize: "35px",
    fontWeight: "900",
    fontFamily: "inherit",
  },
  backButtonBar: {
    width:"90%",
    flexDirection:'row',
    justifyContent:'space-between'
  },
  deleteButton: {
    width:'40px',
    height:'40px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    bottom: "0",
    height: "70px",
    width:"100%",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "column",
    borderTopWidth: "1px",
    borderColor: "#DADADA",
    backgroundColor: "white",
  },
  text: {
    fontSize: "17px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  content: {
    width:"90%",
    flex:"1",
  },
  inputContainer: {
    width:'85%',
    paddingBottom: "20px",
  },
  normalBoldText: {
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "inherit",
    paddingVertical:'10px'
  },
  textInput: {
    height: "45px",
    color: "#6A6A6A",
    borderWidth: "1px",
    borderRadius: "12px",
    padding: "15px",
    borderColor: "#DADADA",
  },
  imageInput: {
    width:'100%',
    height: "400px",
    color: "#6A6A6A",
    borderWidth: "1px",
    borderRadius: "12px",
    padding: "15px",
    borderColor: "#DADADA",
    position:"absolute",
    backgroundColor:'#F4F4F4',
    zIndex:-1,
    justifyContent:'center',
    alignItems:'center'
  },
  receiptImage: {
    width:'100%',
    height: "400px",
    borderRadius:'12px',
    borderWidth:'1px',
    borderColor:'#DADADA'
  },
  inputContainer: {
    paddingVertical:'5px',
    width:'90%',
    maxWidth: '450px'
  },
  buttonContainer: {
    width:"50%",
    justifyContent:"center",
    alignItems:"center"
  },
  dropdownStyles: {
    position:"absolute",
    width:"100%",
    top:35,
    zIndex:1,
    backgroundColor:"white",
    borderColor:"#DADADA"
  },
  dropdownItemStyles: {
    marginHorizontal:"5px",
    height:"40px",
  },
  dropdownTextStyles: {
    color: "#6A6A6A",
  },
  boxStyles: {
    borderColor:"#DADADA",
  },
  inputStyles: {
    color: "#6A6A6A",
  },
});
