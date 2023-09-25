const tableList = document.getElementById("tableList");
const rightDiv = document.getElementById("rightDiv");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const {
      data: { success, result },
    } = await axios.get("http://localhost:5050/show-tables");

    if (!success) return alert("Something went wrong");

    const allData = JSON.parse(result).map(
      (table) => table["Tables_in_db-management"]
    );
    allData.forEach((data) => {
      showTables(data);
    });
  } catch (error) {
    console.log(error);
  }
});

// create table form generation
const createTable = document.getElementById("createTable");

createTable.addEventListener("click", () => {
  createTable.setAttribute("disabled", "");
  const createTableFormHTMLDiv = document.getElementById(
    "createTableFormHTMLDiv"
  );
  createTableFormHTMLDiv.style.display = "block";
  const createTableFormDiv = document.createElement("div");
  createTableFormDiv.setAttribute("id", "createTableFormDiv");
  createTableFormDiv.setAttribute(
    "style",
    `
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 750px;
`
  );
  createTableFormDiv.className = "position-absolute";
  createTableFormDiv.innerHTML = `<form
  id="createTableForm"
  class="form-control bg-light px-5 py-4 position-relative"
>
  <button
    onclick="{
    document.getElementById('createTableFormDiv').remove();
    document.getElementById('createTable').removeAttribute('disabled');
    document.getElementById('createTableFormHTMLDiv').style.display='none';
  }"
    id="closeBtn"
    type="button"
    class="position-absolute fs-3 text-danger fw-bold"
    style="
      top: 0;
      right: 5px;
      background: transparent;
      border: none;
      outline: none;
    "
  >
    X
  </button>
  <h5 class="text-center pb-4">Create Table</h5>
  <div class="col-12 pe-3 mb-3">
    <label for="tableName" class="form-label">Table Name:</label>
    <input
      required
      id="tableName"
      type="text"
      class="form-control w-50 pe-3"
      placeholder="Table Name"
    />
  </div>
  <div class="row g-3" id="addNewFieldDiv">
    <div class="col-md-6">
      <input
        required
        type="text"
        class="form-control fieldNames"
        placeholder="Field Name"
      />
    </div>
    <div class="col-md-6">
      <select class="form-select types" required>
        <option disabled selected value="">Type</option>
        <option value="STRING">STRING</option>
        <option value="NUMBER">NUMBER</option>
        <option value="DOUBLE">DOUBLE</option>
      </select>
    </div>
  </div>
  <div class="col-12 my-3">
    <button
      id="addNewField"
      type="button"
      class="text-primary fw-bold fs-5"
      style="
        background: transparent !important;
        outline: none !important;
        border: none;
      "
    >
      Add another field
    </button>
  </div>

  <div class="col-12">
    <button type="submit" class="btn btn-success">SUBMIT</button>
  </div>
</form>`;
  createTableFormHTMLDiv.appendChild(createTableFormDiv);

  const addNewField = document.getElementById("addNewField");
  addNewField.addEventListener("click", addNewFieldForm);
  function addNewFieldForm() {
    const div1 = document.createElement("div");
    div1.className = "col-md-6";

    div1.innerHTML = `<input
            required
            type="text"
            class="form-control fieldNames"
            placeholder="Field Name"
          />`;

    const div2 = document.createElement("div");
    div2.className = "col-md-6";

    div2.innerHTML = `<select class="form-select types" required>
            <option disabled selected value="">Type</option>
            <option value="STRING">STRING</option>
            <option value="NUMBER">NUMBER</option>
            <option value="DOUBLE">DOUBLE</option>
          </select>`;

    addNewFieldDiv.appendChild(div1);
    addNewFieldDiv.appendChild(div2);
  }

  const createTableForm = document.getElementById("createTableForm");
  createTableForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const allInputs1 = document.getElementsByClassName("fieldNames");
    const allInputs2 = document.getElementsByClassName("types");

    const tableName = document.getElementById("tableName");
    const columns = [];

    for (let i = 0; i < allInputs1.length; i++) {
      columns.push({ name: allInputs1[i].value, type: allInputs2[i].value });
    }

    const { data } = await axios.post("http://localhost:5050", {
      tableName: tableName.value,
      columns,
    });

    if (!data.success) return alert(data.message);

    console.log(data);
    alert(data.message);
    document.getElementById("createTableFormDiv").remove();
    document.getElementById("createTableFormHTMLDiv").style.display = "none";
    createTable.removeAttribute("disabled");
    showTables(tableName.value);
  });
});

async function showTables(tableName) {
  const createdTableName = document.createElement("li");
  createdTableName.className = "list-group-item list-group-item-info";
  createdTableName.style.cursor = "pointer";
  createdTableName.innerHTML = tableName;
  tableList.appendChild(createdTableName);

  createdTableName.addEventListener("click", impFun);

  async function impFun() {
    const { data } = await axios.get(`http://localhost:5050/${tableName}`);

    console.log(Array.from(rightDiv.children).length);
    if (Array.from(rightDiv.children).length > 1) {
      document.getElementById("dbTableDetails").remove();
      document.getElementById("insertData").remove();
    }
    if (Array.from(rightDiv.children).length == 1) {
      document.getElementById("insertData").remove();
    }

    const insertData = document.createElement("button");
    insertData.className = "btn btn-warning fw-bold text-uppercase mb-3";
    insertData.setAttribute("id", "insertData");
    insertData.textContent = `Insert Data into ${tableName} table`;
    rightDiv.appendChild(insertData);

    const insertDataFormHTMLDiv = document.getElementById(
      "insertDataFormHTMLDiv"
    );

    insertData.addEventListener("click", async () => {
      try {
        console.log(data.tableDesc);
        insertDataFormHTMLDiv.style.display = "block";

        const insertDataFormDiv = document.createElement("div");
        insertDataFormDiv.setAttribute("id", "insertDataFormDiv");
        insertDataFormDiv.className = "position-absolute";
        insertDataFormDiv.setAttribute(
          "style",
          `
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 750px;
      `
        );

        function typeIdentify(type) {
          switch (type) {
            case "varchar(255)":
              return "text";
            case "int":
              return "number";
            case "decimal(10,2)":
              return "number";
            default:
              throw new Error("DataType not defined");
          }
        }

        insertDataFormDiv.innerHTML = `<form
        id="inserdDataSubmitForm"
        class="form-control bg-light px-5 py-4 position-relative"
      >
        <button
          onclick="{
          document.getElementById('insertDataFormDiv').remove();
          document.getElementById('insertDataFormHTMLDiv').style.display = 'none';
        }"
          type="button"
          class="position-absolute fs-3 text-danger fw-bold"
          style="
            top: 0;
            right: 5px;
            background: transparent;
            border: none;
            outline: none;
          "
        >
          X
        </button>
        <h5 class="text-center pb-4">Insert Data</h5>
        <div class="row g-3" id="tableDescRow">
        </div>
      </form>`;

        insertDataFormHTMLDiv.appendChild(insertDataFormDiv);

        data.tableDesc.forEach((desc) => {
          // console.log(desc);
          const div = document.createElement("div");
          div.className = "col-md-6";
          div.innerHTML = `<label for='${desc.Field}' class="form-label mb-1">${
            desc.Field
          }:</label>
              <input
                required
                id='${desc.Field}'
                name='${desc.Field}'
                type='${typeIdentify(desc.Type)}'
                class="form-control"
                placeholder='${desc.Field}'
              />`;
          // console.log(div);
          document.getElementById("tableDescRow").appendChild(div);
        });
        const submitBtnDiv = document.createElement("div");
        submitBtnDiv.className = "col-12";
        submitBtnDiv.innerHTML = `<button type="submit" class="btn btn-success">SUBMIT</button>`;
        document.getElementById("tableDescRow").appendChild(submitBtnDiv);

        const inserdDataSubmitForm = document.getElementById(
          "inserdDataSubmitForm"
        );
        inserdDataSubmitForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(inserdDataSubmitForm);
          const formDataObject = { tableName };

          formData.forEach(function (value, key) {
            formDataObject[key] = value;
          });
          console.log(formDataObject);
          try {
            const { data } = await axios.post(
              "http://localhost:5050/add-data",
              formDataObject
            );
            console.log(data);
            if (!data.success) return alert("something went wrong");

            document.getElementById("insertDataFormDiv").remove();
            document.getElementById("insertDataFormHTMLDiv").style.display =
              "none";
            impFun();
            alert(data.message);
          } catch (error) {
            console.log(error);
          }
        });
      } catch (error) {
        console.log(error);
      }
    });

    if (data.result.length === 0) {
      return alert(`No data found in ${tableName} table!`);
    }

    const table = document.createElement("table");

    table.className = "w-100 table table-bordered";
    table.setAttribute("id", "dbTableDetails");

    // Create table headers dynamically based on the data keys
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headerKeys = Object.keys(data.result[0]);

    headerKeys.forEach((key) => {
      const th = document.createElement("th");
      if (key !== "updatedAt") {
        th.textContent = key;
        headerRow.appendChild(th);
      }
    });

    const action = document.createElement("th");
    action.textContent = "action";
    headerRow.appendChild(action);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body with data rows
    const tbody = document.createElement("tbody");
    data.result.forEach((item) => {
      const row = document.createElement("tr");
      headerKeys.forEach((key) => {
        // console.log(item.id);
        const td = document.createElement("td");
        if (key !== "updatedAt") {
          td.textContent = item[key];
          row.appendChild(td);
        }
      });
      const td = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger btn-sm";
      delBtn.innerHTML = "DELETE";
      td.appendChild(delBtn);
      row.appendChild(td);
      tbody.appendChild(row);

      delBtn.addEventListener("click", async () => {
        const { data } = await axios.delete(
          `http://localhost:5050/${tableName}/${item.id}`
        );
        if (!data.success) return alert("Somthing went wrong!");
        alert(data.message);
        tbody.removeChild(row);
      });
    });

    table.appendChild(tbody);
    rightDiv.appendChild(table);
  }
}
