const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/login/index.html';
  }
});

async function checkInitials(initials){
    const response = await fetch(`https://referencenumber.onrender.com/checkInitials?initials=${initials}`,{
        headers: {
        'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.unique;
}

async function getID(initials){
    const response = await fetch(`https://referencenumber.onrender.com/getId?initials=${initials}`,{
        headers: {
        'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data[0].id;
}

async function insertData(reference, initials, subject, address, clientName){
    const payload = {reference, initials, subject, address, clientName};

    const response = await fetch('https://referencenumber.onrender.com/insert',{
        method:'POST',
        headers:{'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
    });
    const data =  await response.json();

    return data.message;
}

const clientInput = document.getElementById('heroSearch');
const dateInput = document.getElementById('refDate');
const subjectInput = document.getElementById('letterSub');
const addressInput = document.getElementById('letterAddress');
const generateButton = document.querySelector('.btn-generate');
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("modal");
const searchbtn = document.getElementById('search-btn');

function resetForm() {
  clientInput.value = '';
  dateInput.value = '';
  subjectInput.value = 'RE: ';
  addressInput.value = '';
}

if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.classList.remove('open');
    resetForm();
    });
}

if (modal) {
    modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
    });
}

generateButton.addEventListener('click', async function(){
    const clientName = clientInput.value.trim();
    const dateValue = dateInput.value;
    const subjectValue = subjectInput.value;
    const addressValue = addressInput.value;
    generateButton.textContent='Generating Number..';

    const [year, month, day]= dateValue.split('-');

    const partialReference = `ACA/${month}/${year}`;

    let clientNameArray = clientName.split(' ');
    let clientInitials = '';
    for (let i = 0 ; i < clientNameArray.length; i++){
        clientInitials += clientNameArray[i][0].toUpperCase();
    }
    
    let isUnique = await checkInitials(clientInitials);

    if (!isUnique){
        console.log(`Initials ${clientInitials} are taken. Adding ... `);

        const lastName = clientNameArray[clientNameArray.length - 1 ];

        if (lastName && lastName.length > 1) {
            clientInitials += lastName[1].toUpperCase();
        } else {
            clientInitials += '2';
        }
    }

    const isInserted = await insertData(partialReference, clientInitials, subjectValue, addressValue, clientName);
    const clientID = await getID(clientInitials);
    
    const finalreferenceID = `${clientID}/${partialReference}/${clientInitials}`;
    const referenceStrong = document.getElementById('strong');
    referenceStrong.textContent = finalreferenceID;
    modal.style.display = 'flex';
    modal.classList.add('open');
    generateButton.textContent='Generate';
})

function logout() {
  localStorage.removeItem('token');
  sessionStorage.clear();
  window.location.href = '/login/index.html';
}

searchbtn.addEventListener('click', function(e){
    e.preventDefault();
    window.location.href='/search/index.html';
})