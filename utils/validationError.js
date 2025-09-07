export default class ValidationError extends Error { 
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields; // optional: ['Email','Telephone number']
  }
}
