//create a variable to hold db connection
let db;
//establish a connection to IndexedDB database called 'pizza_hunt' and set it to version one
const request = indexedDB.open('pizza_hunt', 1);

//this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    //save reference to the database
    const db = event.target.result;
    //create an object store (table) called new_pizza, set it to have an auto incrementing PK
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

//upon a successful
request.onsuccess = function(event) {
    //when db is successfully created with its object store
    db = event.target.result;

    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transaction.objectStore('new_pizza');

    pizzaObjectStore.add(record);
};

function uploadPizza() {
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transaction.objectStore('new_pizza');

    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
            
                //open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access the new_pizza object store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                //clear all items in your store
                pizzaObjectStore.clear();

                alert('All saved pizzas have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

//listen for app coming back online
window.addEventListener('online', uploadPizza);

