import Form from "react-bootstrap/Form";
import { FormSelectProps } from "react-bootstrap/FormSelect";

import { getCategories } from "../../../services/redux/moneySlice";
import { useAppSelector } from "../../../services/redux/store";

type CategorySelectProps = FormSelectProps

export default function CategorySelect(props: CategorySelectProps) {
  const categories = useAppSelector(getCategories);

  return (
    <Form.Select {...props}>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </Form.Select>
  );
}