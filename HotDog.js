const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    SAUCE:   Symbol("sauce"),
    REQ:    Symbol("req"),
    FRIES:  Symbol("fries"),
    PAYMENT: Symbol("payment")
 
});



const largeHotDog = 10;
const smallHotDog = 4;
const friesPrice = 3;

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sSauce = "";
        this.sReq = "";
        this.sFries = "";
        this.sItem = "Hot Dog";
        this.sTotalPrice = 0;
        
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.SIZE;
                aReturn.push("Welcome to Vincent Hot Dog");
                aReturn.push("What size Hot Dog would you like?");
                break;
            case OrderState.SIZE:
              this.nlarge = largeHotDog;
              this.nsmall = smallHotDog;
              if(sInput.toLowerCase()=="small" || sInput.toLowerCase()=="large"){
                this.stateCur = OrderState.SAUCE
                this.sSize = sInput;
                if(sInput.toLowerCase()=="small"){
                  this.sTotalPrice=this.nsmall;
                }
                else{
                  this.sTotalPrice=this.nlarge;
                }
                
                aReturn.push("What Sauce would you like?");
                }
              else{
                aReturn.push("Please select Large or Small")
              }
              break;
              
            case OrderState.SAUCE:
                this.stateCur = OrderState.REQ
                this.sSauce = sInput;
                aReturn.push("Any special requirement for your hot dog?");
                break;

            case OrderState.REQ:
                this.stateCur = OrderState.FRIES
                this.sReq = sInput;
                aReturn.push("Would you like fries with that?");
                break;


            case OrderState.FRIES:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = 0;
                this.nFries = friesPrice;
                if(sInput.toLowerCase() != "no"){
                    this.sFries = sInput;
                    this.sTotalPrice = this.sTotalPrice + this.nFries;
                }
                this.nOrder=this.sTotalPrice;
                
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSauce}, ${this.sSize} ${this.sItem} Special Req: ${this.sReq} `);
                if(this.sFries){
                    aReturn.push(`For the fries: ${this.sFries}`);
                }
                aReturn.push(`Please pay for your order here with $ ${this.sTotalPrice}`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                
                aReturn.push(`Address will be ${this.sAddress}`)
                aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }

     
      const sClientID = "AajADx1msbu3gScOUz73Xt6_oclV2geaDPRaxOe1cUL0YClRXbrUq3qfJIU11yeqzENaL0fESon89-8j"
      // const sClientID = process.env.SB_CLIENT_ID || 
      'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                   
                  }]


                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.

                  var PayPalAddress = details.payer.email_address;//(This is correct)
                  alert(PayPalAddress);

                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}