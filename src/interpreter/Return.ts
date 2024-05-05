/**
 * Represents a custom error class for returning a value from a function.
 */
export class Return extends ReferenceError {
  value: any;
  constructor(value: any) {
    super();
    this.value = value;
  }
}
