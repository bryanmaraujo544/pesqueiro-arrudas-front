export const productsReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'add-products': {
      return { value: action.payload };
    }
    case 'add':
      return { value: [...state.value, action.payload] };
    case 'increment-amount': {
      const newState = state.value.map((product: any) => {
        if (product._id === action.payload.id) {
          return { ...product, amount: product.amount + 1 };
        }
        return product;
      });
      return { value: [...newState] };
    }
    case 'decrement-amount': {
      const newState = state.value.map((product: any) => {
        if (product._id === action.payload.id) {
          return {
            ...product,
            amount: product.amount > 0 ? product.amount - 1 : product.amount,
          };
        }
        return product;
      });
      return { value: [...newState] };
    }
    case 'delete': {
      const newState = state.value.filter(
        (product: any) => product._id !== action.payload.product._id
      );
      return { value: newState };
    }
    default:
      throw new Error('This type is invalid');
  }
};
