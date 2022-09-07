
# USER SIGNUP 
This endpoint allows user to update their payment link 


###### ENDPOINT 
> /api/v1/paymentLink/:_id


###### METHOD 
> POST 



###### REQUEST BODY 
```javascript 
{
// enter properties to update here 
    "amount": 50000,
}
```

###### RESPONSE CODES 

CODE | MEANING 
-----|-------- 
200  | payment link updated successfully 
400  | Bad request body 
500  | Server error 


### Sample Responses 

#### 200

```javascript 
{
	"success": true,
	"msg": " payment linked updated",
	"paymentLink": {
		"_id": "62bf8de0a934ebd6cc4a259e",
		"merchant_id": "62bf86bd489569c1ee8ca0e3",
		"name": "tea payment",
		"amount": 10000,
		"description": "This link is payment of our magic tea",
		"link": "http://localhost:3000/api/v1/payment/magicTea",
		"currency": "NGN",
		"redirect_url": "https://www.google.com",
		"paymentCount": 0,
		"link_id": "magicTea",
		"createdOn": "2022-07-02T00:14:24.896Z",
		"__v": 0
	}
}
```

    
    
####  500 
```javascript 
{
	"sucess": false,
	"msg": " Server encountered error while updating payment link"
}
```