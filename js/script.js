// Login Const
const login = document.querySelector(".login");
const loginH2 = login.querySelector("h2");
const loginButtonSubmit = document.querySelector(".login-btn");
const loginUsername = document.querySelector(".username input");
const loginPassword = document.querySelector(".password input");

// Register Const
const register = document.querySelector(".register");
const regH2 = register.querySelector("h2");
const registerButton = document.querySelector(".register-btn");
const regUsername = document.querySelector(".email input");
const regPassword = document.querySelector(".reg-password input");

// Register Error Const
const regErrorMessage = document.createElement("p");
regErrorMessage.classList.add("reg-error-message");

// Login Error Const
const loginErrorMessage = document.createElement("p");
loginErrorMessage.classList.add("login-error-message");

const loginButton = document.querySelector(".header-login-btn");
const logoutButton = document.querySelector(".logout-btn");
const logRegContainer = document.querySelector(".log-reg-container")

// To do Const
const title = document.querySelector(".title input");
const description = document.querySelector(".description input");
const todo = document.querySelector(".to-do");
const listOfToDo = document.querySelector(".list-of-todo");

// Other Const
const message = document.querySelector(".message");
const toDo = document.querySelector(".to-do");
const authCookieName = "authToken";

let userToken;

window.addEventListener("DOMContentLoaded", async () =>{
    const currentUser = getAuthCookie();
    if (currentUser){
        userToken = currentUser;
        logRegContainer.hidden = true;
        message.hidden = true;
        toDo.hidden = false;
        loginButton.hidden = true;
        logoutButton.hidden = false;
        await toDoRefresh();
    }

})

// register user
register.addEventListener("submit", function (element) {
    element.preventDefault();
    registerUser(regUsername.value,regPassword.value);
})

// login user
login.addEventListener("submit", async (element) => {
    element.preventDefault();
    await loginUser(loginUsername.value, loginPassword.value);
    toDo.hidden = true;
    await toDoRefresh();
});

// create to do
todo.addEventListener("submit", async function(element) {
    element.preventDefault();

    const toDoItemCreated = await createToDo(title.value, description.value);

    if(!toDoItemCreated){
        return
    }

    await toDoRefresh();

    title.value = ""
    description.value = "";


})

// register
async function registerUser(username, password){
    regErrorMessage.hidden = true;
    regErrorMessage.textContent = "";

    try{
        const responseAPI = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: `${username}`,
                password: `${password}`
            })
        })

        if (!responseAPI.ok){
            const errorInfo = await responseAPI.json();
            regErrorMessage.textContent = errorInfo.error || "Registration was not successful";
            regH2.insertAdjacentElement("afterend", regErrorMessage)
            regErrorMessage.hidden = false;
            return;
        }
        else{
            regErrorMessage.hidden = true;
            const obj = await responseAPI.json();   
            userToken = obj.token;  
            setAuthCookie(userToken);
        }

        if (userToken){
            message.hidden = false;
            message.querySelector("p").textContent = "User has been created";
            logRegContainer.hidden = true;
            toDo.hidden = true;
            loginButton.hidden = true;
            logoutButton.hidden = false;

        }
        
    }

    catch (error){
        regErrorMessage.hidden = false;
        regErrorMessage.textContent = "Registration was not successful";
        regH2.insertAdjacentElement("afterend", regErrorMessage);

    }
}

// Login
async function loginUser(username, password){
    try{
        const responseAPI = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: `${username}`,
                password: `${password}`
            })
        })

        const responseDataAPI = await responseAPI.json();
        if (!responseAPI.ok){
            loginErrorMessage.textContent = responseDataAPI.error || "Login was not successful";
            loginH2.insertAdjacentElement("afterend", loginErrorMessage)
            loginErrorMessage.hidden = false;
            return
        }
        else{
            loginErrorMessage.hidden = true;
            userToken = responseDataAPI.token;
            setAuthCookie(userToken);
        }

        if (userToken){
            message.hidden = false;
            message.querySelector("p").textContent = "Login was successful";
            logRegContainer.hidden = true;
            toDo.hidden = true
            loginButton.hidden = true;
            logoutButton.hidden = false;

        }

    }
    catch(error){           
        loginErrorMessage.hidden = false; 
        loginErrorMessage.textContent = "Login was not successful";
        loginH2.insertAdjacentElement("afterend", loginErrorMessage)
    }
}

// Logout
async function logoutUser() {
    try{
        if(!userToken){
            userToken = null;
            clearAuthCookie(); 
            logRegContainer.hidden = false;
            message.hidden = true;
            toDo.hidden = true;
            loginButton.hidden = false;
            logoutButton.hidden = true;
            return;
        }

        const responseAPI = await fetch("http://localhost:3000/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const responseDataAPI = await responseAPI.json();

        if (!responseAPI.ok){
            console.log(`Logout was unsuccessful: ${responseDataAPI.error}`)
        }

    }
    catch (error){
        console.log(error);
    }

    userToken = null;
    clearAuthCookie();


    logRegContainer.hidden = false;
    message.hidden = true;
    toDo.hidden = true;
    loginButton.hidden = false;
    logoutButton.hidden = true;
}

// To do functions
// create ToDo item
async function createToDo(title, description) {
    try{
        if (!userToken){
            return;
        }

        const responseAPI = await fetch("http://localhost:3000/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },

            body: JSON.stringify({
                title: `${title}`,
                description: `${description}`
            })
            
        })

        const responseDataAPI = await responseAPI.json();

        if(!responseAPI.ok){
            console.log(`Couldn't create item: ${responseDataAPI.error}`)
            return null;
        }
        else{
            return responseDataAPI;
        }


    }
    catch(error){
        console.log(error);

    }
}

// Get Todo List
 async function getToDo() {
    try{
        if (!userToken){
            return;
        }

        const responseAPI = await fetch("http://localhost:3000/todos", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
            
        })

        const responseDataAPI = await responseAPI.json();
        if(!responseAPI.ok){
            console.log(`Couldn't get to do list: ${responseDataAPI.error}`);
            return null;
        }
        else{
            return responseDataAPI;
        }

    }
    catch(error){
        console.log(error);
    }
 }
//  Create visual to do element

 function renderToDo(toDoList){
    listOfToDo.innerHTML = "";

    listOfToDo.hidden = false;

    if (!toDoList || toDoList.length === 0){
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Nothing in your list at the moment!";
        listOfToDo.appendChild(emptyMessage);
        return;
    }

    toDoList.forEach(toDoItem => {
        // Create item container
        const itemContainer = document.createElement("div")
        itemContainer.classList.add("row-of-todo");

        // Create checkbox
        const item = document.createElement("input");
        item.classList.add("todo-item")
        item.type = "checkbox";
        item.id = `todo-${toDoItem.id}`;
        item.checked = toDoItem.completed;
        item.dataset.id = toDoItem.id;
        itemContainer.appendChild(item);
        item.addEventListener("change", async () =>{
            await(updateToDoList(toDoItem.id, item.checked))
            // if (toDoItem.completed){
            //     itemLabel.style.textDecoration = "line-through";
            // }
            // else{
            //     itemLabel.style.textDecoration = "none";

            // }
            await toDoRefresh();
        });
        // Add item text
        const itemLabel = document.createElement("label");
        itemLabel.classList.add("item-label");
        itemLabel.htmlFor = item.id;
        itemLabel.textContent = `${toDoItem.title} - ${toDoItem.description}`;
        itemContainer.appendChild(itemLabel);

        // Add Delete Button

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        deleteButton.type ="button"
        itemContainer.appendChild(deleteButton);
        deleteButton.addEventListener("click", async() =>{
            const del = await deleteToDoItem(toDoItem.id);
            if (del){
                await toDoRefresh();
            }
        })

        // Add Edit button

        const editButton = document.createElement("button");
        editButton.textContent = "Edit"
        editButton.classList.add("edit-btn");
        editButton.type = "button";
        itemContainer.appendChild(editButton);
        editButton.addEventListener("click", async (element) =>{
            deleteButton.hidden = true;
            editButton.hidden = true;
            element.preventDefault();
            const formEdit = document.createElement("form");
            formEdit.classList.add("form-edit");

            const inputTitle = document.createElement("input");
            inputTitle.value = toDoItem.title;

            const inputDescription = document.createElement("input");
            inputDescription.value = toDoItem.description;

            const saveButton = document.createElement("button")
            saveButton.type = "submit";
            saveButton.textContent = "Save";
            
            formEdit.append(inputTitle, inputDescription, saveButton);

            itemContainer.replaceChild(formEdit, itemLabel);

            formEdit.addEventListener("submit", async (element) => {
                element.preventDefault();

                const updated = await editToDoItem(toDoItem.id, inputTitle.value, inputDescription.value)
                if (!updated) {
                    return;
                }else{

                    itemLabel.textContent = `${updated.title} - ${updated.description}`;
                    itemContainer.replaceChild(itemLabel, formEdit);
                    deleteButton.hidden = false;
                    editButton.hidden = false;

                }
            })

        })


        listOfToDo.appendChild(itemContainer);
    });
    
 }
 async function toDoRefresh() {
    const toDoList = await getToDo();
    if(toDoList){
        renderToDo(toDoList);
    }
 }
//  Update to do List

async function updateToDoList(id, completed) {
    try{
        if (!userToken){
            return;
        }

        const responseAPI = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },

            body: JSON.stringify({
                completed: completed
            })
            
        })

        const responseDataAPI = await responseAPI.json();
        if(!responseAPI.ok){
            return null;
        }
        else{
            return responseDataAPI;
        }

    }
    catch(error){
        console.log(error);
    }
}

// Delete an item
async function deleteToDoItem(id) {
    try{
        if (!userToken){
            return;
        }

        const responseAPI = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        if (!responseAPI.ok){
            console.log("Delete was unsuccessful");
            return false;
        }
        else{
            return true;
        }

    }
    catch(error){
        console.log(error);
        return false;
}
    
}

// Edit an item
async function editToDoItem(id, updatedTitle, updatedDescription) {
    try{
        if (!userToken){
            return;
        }

        const responseAPI = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },

            body: JSON.stringify({
                title: `${updatedTitle}`,
                description: `${updatedDescription}`
            })

        })

        const responseDataAPI = await responseAPI.json();
        if(!responseAPI.ok){
            return null;
        }
        else{
            return responseDataAPI;
        }

    }
    catch(error){
        console.log(error);
        return null;
    }
}


// Support Function
async function revealed (){
    logRegContainer.hidden = true;
    message.hidden = true;
    toDo.hidden = false;
    await toDoRefresh();
}

function revealedLogin(){
    logRegContainer.hidden = false;
    message.hidden = true;
    toDo.hidden = true;
}


function setAuthCookie(token){
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `${authCookieName}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  }
  
  function getAuthCookie(){
    const parts = document.cookie.split(";").map(p => p.trim());
    const found = parts.find(p => p.startsWith(authCookieName + "="));
    return found ? decodeURIComponent(found.split("=")[1]) : null;
  }
  
  function clearAuthCookie(){
    document.cookie = `${authCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
  }