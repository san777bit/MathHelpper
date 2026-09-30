export type AppTab = 'whiteboard' | 'plotter' | 'geometry' | 'solver' | 'cheatsheet';

// Whiteboard Types
export type ToolType = 
  | 'pen' 
  | 'marker' 
  | 'eraser' 
  | 'line' 
  | 'arrow' 
  | 'rect' 
  | 'circle' 
  | 'triangle' 
  | 'axes' 
  | 'text' 
  | 'pan';

export type GridType = 'cells' | 'dots' | 'graph' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface DrawElement {
  id: string;
  type: ToolType;
  points: Point[];
  color: string;
  width: number;
  text?: string;
  fill?: boolean;
}

// Plotter Types
export interface PlotFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  isValid: boolean;
  error?: string;
}

export interface PlotParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isPlaying?: boolean;
}

export interface KeyPoint {
  x: number;
  y: number;
  label: string;
  type: 'root' | 'vertex' | 'y-intercept' | 'intersection' | 'extrema';
  color?: string;
}

// Geometry Types
export type GeometryTool =
  | 'select'
  | 'point'
  | 'segment'
  | 'line'
  | 'ray'
  | 'circle'
  | 'polygon'
  | 'perpendicular'
  | 'parallel'
  | 'midpoint'
  | 'bisector'
  | 'tangent'
  | 'measure_distance'
  | 'measure_angle'
  | 'delete';

// Solver Types
export type SolverType =
  | 'linear'
  | 'quadratic'
  | 'inequality'
  | 'system'
  | 'progression'
  | 'factoring';

export interface SolverStep {
  title: string;
  explanation: string;
  math: string;
  note?: string;
}

export interface SolverResult {
  solutionFound: boolean;
  roots?: string[];
  steps: SolverStep[];
  answer: string;
  graphFunctions?: string[];
}

// Cheat Sheet Types
export interface CheatSheetItem {
  id: string;
  title: string;
  category: 'algebra' | 'geometry';
  subcategory: string;
  summary: string;
  formulas: {
    name: string;
    latex: string;
    explanation?: string;
  }[];
  examples: {
    task: string;
    solution: string;
    explanation?: string;
  }[];
  commonMistakes: string[];
  plotFunctions?: string[];
  geometryPreset?: string;
}
