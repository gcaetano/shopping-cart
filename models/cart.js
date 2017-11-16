module.exports = function Cart(oldCart){
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id){
        var storedItems = this.items[id];
        if(!storedItems){
            storedItems = this.items[id] = {items: item, qty: 0, price: 0}
        }
        storedItems.qty++;
        storedItems.price = storedItems.items.price * storedItems.qty;
        this.totalQty++;
        this.totalPrice += storedItems.items.price;
    },

    this.generateArray = function(){
        var arr = [];
        for(var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};