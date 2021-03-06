"use strict";

const CARB_UNIT = "g";
const DOM = React.DOM;

function formatQuantity(qty, unit) {
  qty = Math.round(qty * 100) / 100;
  if (unit === "unit") {
    return qty;
  }
  return `${qty} ${unit}`;
}

class Sucrette extends React.Component {
  constructor(props) {
    super(props);

    this.handleRemovedFood = this.handleRemovedFood.bind(this);
    this.handleNewFood = this.handleNewFood.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);

    this.state = props;
  }

  handleNewFood(food) {
    this.setState({
      foods: [...this.state.foods, food]
    });
  }

  handleRemovedFood(food) {
    let index = this.state.foods.indexOf(food);
    if (index !== -1) {
      this.setState({
        foods: this.state.foods.filter((f, i) => i !== index)
      });
    }
  }

  handleClearAll() {
    this.setState({
      foods: []
    });
  }

  render() {
    return DOM.div({ className: "app-wrapper" },
      React.createElement(Total, { foods: this.state.foods, clearAll: this.handleClearAll }),
      React.createElement(AddFoodForm, {
        addFood: this.handleNewFood
      }),
      React.createElement(FoodList, {
        foods: this.state.foods,
        deleteFood: this.handleRemovedFood
      })
    );
  }
}

class Total extends React.Component {
  render() {
    let total = this.props.foods.map(food => {
      return food.quantity * food.ref.carbs / food.ref.quantity;
    }).reduce((current, previous) => current + previous, 0);

    return DOM.div({ className: "total-carbs" },
      formatQuantity(total, CARB_UNIT),
      React.createElement(DeleteButton, { delete: this.props.clearAll })
    );
  }
}

class AddFoodForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleQtyChange = this.handleQtyChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {ref: null, quantity: null};
  }

  componentDidMount() {
    new Awesomplete(this.foodNameInput, {
      list: FOODS,
      autoFirst: true,
      data: (item, input) => {
        return {
          label: `${item.title} (${formatQuantity(item.carbs, CARB_UNIT)} pour ${formatQuantity(item.quantity, item.unit)})`,
          value: item.title,
          extra: item
        }
      }
    });

    this.foodNameInput.addEventListener("awesomplete-selectcomplete", e => {
      this.setState({ ref: e.text.extra });
      this.qtyInput.focus();
    });

    this.foodNameInput.focus();
  }

  handleQtyChange(e) {
    if (e.target.value) {
      this.setState({ quantity: parseFloat(e.target.value) });
    } else {
      this.setState({ quantity: null });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.addFood(this.state);

    // Start over.
    this.setState({ ref: null, quantity: null });

    this.qtyInput.value = "";
    this.foodNameInput.value = "";
    this.foodNameInput.focus();
  }

  render() {
    return DOM.form({ className: "add-food-form", onSubmit: this.handleSubmit },
      DOM.input({
        className: "food-name",
        placeholder: "Aliment",
        type: "text",
        ref: input => this.foodNameInput = input
      }),
      DOM.input({
        className: "qty",
        placeholder: "Quantité",
        size: 2,
        type: "text",
        value: this.state.quantity,
        ref: input => this.qtyInput = input,
        onChange: this.handleQtyChange
      }),
      DOM.span({ className: "unit" }, this.state.ref ? this.state.ref.unit : ""),
      DOM.button({ type: "submit" }, "OK")
    );
  }
}

class FoodList extends React.Component {
  render() {
    return DOM.ul({ className: "foods" },
      this.props.foods.map(food => React.createElement(FoodItem, {
        food,
        deleteFood: this.props.deleteFood.bind(null, food)
      }))
    );
  }
}

class FoodItem extends React.Component {
  render() {
    let {quantity, ref} = this.props.food;
    let total = quantity * ref.carbs / ref.quantity;

    return DOM.li({ className: "food" },
      DOM.span({ className: "title" }, ref.title),
      DOM.span({ className: "qty" }, "(" + formatQuantity(quantity, ref.unit) + ")"),
      DOM.span({ className: "carbs" }, formatQuantity(total, CARB_UNIT)),
      React.createElement(DeleteButton, { delete: this.props.deleteFood })
    );
  }
}

class DeleteButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.delete();
  }

  render() {
    return DOM.form({className: "delete-button", onSubmit: this.handleSubmit },
      DOM.button({ type: "submit" })
    );
  }
}

const STORE = {
  foods: [{
    quantity: 2,
    ref: {
      title: "farine de blé",
      quantity: 1,
      unit: "cups",
      carbs: 56
    }
  }, {
    quantity: 25,
    ref: {
      title: "sucre roux",
      quantity: 100,
      unit: "g",
      carbs: 75
    }
  }]
};
ReactDOM.render(React.createElement(Sucrette, STORE), document.querySelector("#app"));
