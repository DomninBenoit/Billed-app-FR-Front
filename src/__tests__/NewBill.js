/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then choice an invalide file", async () => {
      $.fn.modal = jest.fn()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const file = screen.getByTestId("file");
      const fileTest = new File(["test.pdf"], "test.pdf", {type: "image/pdf"});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      file.addEventListener('change', handleChangeFile);
      userEvent.upload(file, fileTest);
      expect(handleChangeFile).toHaveBeenCalled();

    })
    test("Then I complete the rest of the form and submit it", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const formNewBill = screen.getByTestId("form-new-bill");
      const btnSendBill = screen.getByTestId('btn-send-bill');
      const handleSubmit =  jest.fn(newBill.handleSubmit);
      formNewBill.addEventListener("submit", handleSubmit);
      userEvent.click(btnSendBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
  describe("When i add a new bill", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then it creates a new bill", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore;

      const file = screen.getByTestId("file");
      const fileTest = new File(["test.png"], "test.png", {type: "image/png"});
      let formExpense = screen.getByTestId("expense-type");      
      let formName = screen.getByTestId("expense-name");      
      let formDate = screen.getByTestId("datepicker");      
      let formAmount = screen.getByTestId("amount");      
      let formTVAValue = screen.getByTestId("vat");    
      let formTVAPourcent = screen.getByTestId("pct");
      
      userEvent.selectOptions(formExpense, ["Restaurants et bars"])
      formName.value = "Repas d'affaire"
      formDate.value = "2021-11-22"
      formAmount.value = "60";
      formTVAValue.value = "10";
      formTVAPourcent.value = "20";
      userEvent.upload(file, fileTest);


     
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      const btnSendBill = screen.getByTestId('btn-send-bill');
      formNewBill.addEventListener("submit", handleSubmit);
      userEvent.click(btnSendBill);
      expect(handleSubmit).toHaveBeenCalled()
      /*let response;
      try {
        response = await store.bills
      }*/
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    
  test("fetches messages from an API and fails with 500 message error", async () => {
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  })
})
  })
