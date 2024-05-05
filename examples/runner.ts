import { Interpreter } from "../src/interpreter/Interpreter";
import { Parser } from "../src/Parser";

const args = process.argv.slice(2);

if (!args) throw new Error("Please provide a example name");

run(args[0]);

function run(file: string) {
  const parser = new Parser();
  const interpreter = new Interpreter();

  const code=`
  
  def sirKoSalamKaro(sirKaNaam)
  {
    print("Salam Sir", sirKaNaam);
  }

  def factorialCalculateKarKDo(number) {
    Agr ( number== 0) {
      WapisBhejo 1;
    }
    WapisBhejo number * factorialCalculateKarKDo(number - 1);
  }

  def factorialIterationSe(n) {
    Banao fac = 1;
    for (Banao i = 1; i < n + 1; i +=1) {
      fac *= i;
    } 
  
    WapisBhejo fac;
  }
  
  sirKoSalamKaro("Atif");
  print("Factorial Calculate ho gya: ",factorialCalculateKarKDo(5));
  print("Factorial Iterations se calcualte hua: ",factorialIterationSe(5));
  `;

  const code2 = `
  def kyaNumber100SeBadaHai(number) {
    Agr (number > 100) {
      WapisBhejo Sahi;
    }
    WapisBhejo Ghalat;
  }

  print(kyaNumber100SeBadaHai(99));
  print(kyaNumber100SeBadaHai(101));
  `;
  
  
  const ast = parser.parse(
    code2
  );

  interpreter.execute(ast);
}



