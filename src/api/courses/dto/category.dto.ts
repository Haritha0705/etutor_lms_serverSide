export class CourseResponseDto {
  title: string;
  price: number;
  rating: number;
}

export class SubCategoryResponseDto {
  name: string;
  icon?: string;
  coursesCount: number;
}

export class CategoryResponseDto {
  name: string;
  icon?: string;
  coursesCount: number;
  subCategories: SubCategoryResponseDto[];
  courses: CourseResponseDto[];
}
