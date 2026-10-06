import { ProjectFile } from '../types';

export const INITIAL_FILES: Record<string, ProjectFile> = {
  'root': {
    id: 'root',
    name: 'JBlockProject',
    path: '/JBlockProject',
    content: '',
    isFolder: true,
    parentId: null,
    children: ['src', 'readme'],
  },
  'src': {
    id: 'src',
    name: 'src',
    path: '/JBlockProject/src',
    content: '',
    isFolder: true,
    parentId: 'root',
    children: ['main_java', 'student_java', 'calculator_java'],
  },
  'main_java': {
    id: 'main_java',
    name: 'Main.java',
    path: '/JBlockProject/src/Main.java',
    content: `// Welcome to JBlock - Simple Java Development Environment
// Version 0.1

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, welcome to JBlock!");
        System.out.println("A simple Java IDE designed for beginners.");
        
        // Let's create a Student object
        Student student = new Student("Farhan", 21);
        student.introduce();
        
        // Using our Calculator class
        int sum = Calculator.add(15, 27);
        System.out.println("Sum of 15 + 27 = " + sum);
        
        System.out.println("Programming in Java is simple and fun!");
    }
}
`,
    isFolder: false,
    parentId: 'src',
  },
  'student_java': {
    id: 'student_java',
    name: 'Student.java',
    path: '/JBlockProject/src/Student.java',
    content: `public class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void introduce() {
        System.out.println("Student Name: " + this.name + ", Age: " + this.age);
    }

    public String getName() {
        return this.name;
    }

    public int getAge() {
        return this.age;
    }
}
`,
    isFolder: false,
    parentId: 'src',
  },
  'calculator_java': {
    id: 'calculator_java',
    name: 'Calculator.java',
    path: '/JBlockProject/src/Calculator.java',
    content: `public class Calculator {
    
    public static int add(int a, int b) {
        return a + b;
    }

    public static int subtract(int a, int b) {
        return a - b;
    }

    public static int multiply(int a, int b) {
        return a * b;
    }

    public static double divide(double a, double b) {
        if (b == 0) {
            System.out.println("Error: Division by zero!");
            return 0;
        }
        return a / b;
    }
}
`,
    isFolder: false,
    parentId: 'src',
  },
  'readme': {
    id: 'readme',
    name: 'README.txt',
    path: '/JBlockProject/README.txt',
    content: `=====================================================
JBlock - Simple Java Development Environment (v0.1)
=====================================================

Welcome to JBlock!
Designed for simplicity, focus, and beginner-friendly Java programming.

KEYBOARD SHORTCUTS:
- Ctrl + N         : New Java File
- Ctrl + O         : Open Java File
- Ctrl + S         : Save File
- Ctrl + Shift + S : Save As
- Ctrl + W         : Close Active Tab
- Ctrl + F         : Find
- Ctrl + H         : Replace
- F9               : Compile
- F10              : Run
- F11              : Compile & Run
- Esc              : Stop Program

FEATURES IN VERSION 0.1:
✓ Traditional lightweight desktop layout (inspired by Code::Blocks simplicity)
✓ Full Java source code editor with line numbers and syntax highlighting
✓ Multiple tabbed document interface with unsaved changes indicator (*)
✓ Project file explorer with create/open/delete operations
✓ Bottom panel with Output, Problems, and Terminal tabs
✓ Status bar showing JDK detection status, line/col numbers, and encoding

NEXT STEPS (VERSION 0.2):
- Local Java JDK process runner connection (javac and java local execution)
`,
    isFolder: false,
    parentId: 'root',
  },
};
