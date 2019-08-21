use rand;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub struct PointCloud {
    speed: usize,
    end: usize,
    points: Vec<f32>,
    colors: Vec<f32>,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl PointCloud {
    pub fn new(nb_points: usize, speed: usize) -> PointCloud {
        let points = vec![0.0; 3 * nb_points];
        let colors = vec![0.0; 3 * nb_points];
        console_log!("PointCloud initialized");
        PointCloud {
            speed,
            end: 0,
            points,
            colors,
        }
    }

    pub fn points(&self) -> *const f32 {
        self.points.as_ptr()
    }

    pub fn colors(&self) -> *const f32 {
        self.colors.as_ptr()
    }

    pub fn tick(&mut self) -> usize {
        let start = self.end;
        self.end = std::cmp::min(self.points.len(), self.end + 3 * self.speed);
        let points = &mut self.points[start..self.end];
        let colors = &mut self.colors[start..self.end];
        colors.iter_mut().for_each(|x| *x = rand::random());
        points
            .iter_mut()
            .for_each(|x| *x = 100.0 * (rand::random::<f32>() - 0.5));
        self.end
    }
}
