const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/login';
  }
});

async function insertData(reference, initials, subject, address, clientName, year){
    const payload = {reference, initials, subject, address, clientName, year};

    const response = await fetch('https://referencenumber.onrender.com/insert',{
        method:'POST',
        headers:{'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
    });
    const data =  await response.json();

    return data.data;
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
    generateButton.disabled = false;
    resetForm();
    });
}

if (modal) {
    modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
        generateButton.disabled = false;
    }
    });
}

generateButton.addEventListener('click', async function(){
    const clientName = clientInput.value.trim();
    const dateValue = dateInput.value;
    const subjectValue = subjectInput.value;
    const addressValue = addressInput.value;
    generateButton.innerHTML = `
        <i class="fa-solid fa-bolt"></i> Generating Number...
    `;
    generateButton.disabled = true;

    const [year, month, day]= dateValue.split('-');

    const partialReference = `ACA/${month}/${year}`;

    let clientNameArray = clientName.split(' ');
    let clientInitials = '';
    for (let i = 0 ; i < clientNameArray.length; i++){
        clientInitials += clientNameArray[i][0].toUpperCase();
    }

    const isInserted = await insertData(partialReference, clientInitials, subjectValue, addressValue, clientName, year);
    
    const finalreferenceID = `${String(isInserted.id).padStart(4,'0')}/${partialReference}/${clientInitials}`;
    const referenceStrong = document.getElementById('strong');
    referenceStrong.textContent = finalreferenceID;
    modal.style.display = 'flex';
    modal.classList.add('open');
    generateButton.innerHTML = `
        <i class="fa-solid fa-bolt"></i> Generate
    `;
})

function logout() {
  localStorage.removeItem('token');
  sessionStorage.clear();
  window.location.href = '/login';
}

searchbtn.addEventListener('click', function(e){
    e.preventDefault();
    window.location.href='/search';
})