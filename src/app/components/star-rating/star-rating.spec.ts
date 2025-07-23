import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRating } from './star-rating';

@Component({
  template: `
    <app-star-rating
      [rating]="rating()"
      [readonly]="readonly()"
      (ratingChange)="onRatingChange($event)"
    />
  `,
  imports: [StarRating]
})
class TestHostComponent {
  rating = signal(0);
  readonly = signal(false);
  ratingChange = jasmine.createSpy('ratingChange');

  onRatingChange(newRating: number): void {
    this.ratingChange(newRating);
    this.rating.set(newRating);
  }
}

describe('StarRating', () => {
  let component: StarRating;
  let fixture: ComponentFixture<StarRating>;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRating, TestHostComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StarRating);
    component = fixture.componentInstance;

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stars computed signal', () => {
    it('should generate 5 stars', () => {
      fixture.detectChanges();
      const stars = component.stars();
      expect(stars).toHaveSize(5);
      expect(stars.map(s => s.index)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should fill stars based on rating', () => {
      fixture.componentRef.setInput('rating', 3);
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars[0].filled).toBe(true);
      expect(stars[1].filled).toBe(true);
      expect(stars[2].filled).toBe(true);
      expect(stars[3].filled).toBe(false)
      expect(stars[4].filled).toBe(false)
    });

    it('should fill stars based on hovered rating when hovering', () => {
      fixture.componentRef.setInput('rating', 2);
      fixture.detectChanges();

      component.onStarHover(4);
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars[0].filled).toBe(true);
      expect(stars[1].filled).toBe(true);
      expect(stars[2].filled).toBe(true);
      expect(stars[3].filled).toBe(true);
      expect(stars[4].filled).toBe(false);
    });

    it('should prioritize hovered rating over actual rating', () => {
      fixture.componentRef.setInput('rating', 5);
      fixture.detectChanges();

      component.onStarHover(2);
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars.filter(s => s.filled)).toHaveSize(2);
    });
  });

  describe('onStarClick', () => {
    it('should emit new rating when clicking star', () => {
      hostFixture.detectChanges();
      spyOn(hostComponent, 'onRatingChange');

      const starRatingComponent = hostFixture.debugElement.query(sel => sel.componentInstance instanceof StarRating).componentInstance;
      starRatingComponent.onStarClick(4);

      expect(hostComponent.onRatingChange).toHaveBeenCalledWith(4);
    });

    it('should emit 0 when clicking the same star as current rating', () => {
      hostComponent.rating.set(3);
      hostFixture.detectChanges();
      spyOn(hostComponent, 'onRatingChange');

      const starRatingComponent = hostFixture.debugElement.query(sel => sel.componentInstance instanceof StarRating).componentInstance;
      starRatingComponent.onStarClick(3);

      expect(hostComponent.onRatingChange).toHaveBeenCalledWith(0);
    });

    it('should not emit when readonly is true', () => {
      hostComponent.readonly.set(true);
      hostFixture.detectChanges();
      spyOn(hostComponent, 'onRatingChange');

      const starRatingComponent = hostFixture.debugElement.query(sel => sel.componentInstance instanceof StarRating).componentInstance;
      starRatingComponent.onStarClick(4);

      expect(hostComponent.onRatingChange).not.toHaveBeenCalled();
    });
  });

  describe('onStarHover', () => {
    it('should set hovered rating', () => {
      fixture.detectChanges();
      component.onStarHover(3);

      const stars = component.stars();
      expect(stars.filter(s => s.filled)).toHaveSize(3);
    });

    it('should not set hovered rating when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('rating', 2);
      fixture.detectChanges();

      component.onStarHover(4);
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars.filter(s => s.filled)).toHaveSize(2);
    });
  });

  describe('onMouseLeave', () => {
    it('should clear hovered rating', () => {
      fixture.componentRef.setInput('rating', 2);
      fixture.detectChanges();

      component.onStarHover(4);
      component.onMouseLeave();
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars.filter(s => s.filled)).toHaveSize(2);
    });

    it('should not affect hovered rating when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('rating', 3);
      fixture.detectChanges();

      component.onMouseLeave();
      fixture.detectChanges();

      const stars = component.stars();
      expect(stars.filter(s => s.filled)).toHaveSize(3);
    });
  });

  describe('input properties', () => {
    it('should accept rating input', () => {
      fixture.componentRef.setInput('rating', 4);
      fixture.detectChanges();

      expect(component.rating()).toBe(4);
    });

    it('should accept readonly input', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();

      expect(component.readonly()).toBe(true);
    });

    it('should default rating to 0', () => {
      fixture.detectChanges();
      expect(component.rating()).toBe(0);
    });

    it('should default readonly to false', () => {
      fixture.detectChanges();
      expect(component.readonly()).toBe(false);
    });
  });
});
