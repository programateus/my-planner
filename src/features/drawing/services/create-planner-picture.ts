import { PaintStyle, Skia, type SkTypeface } from "@shopify/react-native-skia";

import type { PlannerTemplateId } from "@/features/drawing/domain/planner-template";
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "@/features/drawing/geometry/notebook-geometry";

const WEEKDAYS = [
  "SEGUNDA",
  "TERÇA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SÁBADO",
  "DOMINGO",
];

export function createPlannerPicture(
  template: PlannerTemplateId,
  typeface: SkTypeface,
  dark: boolean,
) {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(
    Skia.XYWHRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT),
  );
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  const font = Skia.Font(typeface, 14);
  const colors = dark
    ? {
        text: "#DDE2E8",
        muted: "#A2ABB8",
        line: "#454C57",
        accent: "#A5B7CA",
        tint: "#303640",
      }
    : {
        text: "#334155",
        muted: "#7C8898",
        line: "#DCE2E9",
        accent: "#69849E",
        tint: "#F1F5F8",
      };

  function text(
    value: string,
    x: number,
    y: number,
    size = 14,
    color = colors.text,
  ) {
    paint.setStyle(PaintStyle.Fill);
    paint.setColor(Skia.Color(color));
    font.setSize(size);
    canvas.drawText(value, x, y, paint, font);
  }

  function line(x: number, y: number, endX: number, endY = y) {
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    paint.setColor(Skia.Color(colors.line));
    canvas.drawLine(x, y, endX, endY, paint);
  }

  function box(
    x: number,
    y: number,
    width: number,
    height: number,
    fill = false,
  ) {
    paint.setStyle(fill ? PaintStyle.Fill : PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    paint.setColor(Skia.Color(fill ? colors.tint : colors.line));
    canvas.drawRect(Skia.XYWHRect(x, y, width, height), paint);
  }

  function ruled(
    x: number,
    y: number,
    width: number,
    rows: number,
    spacing = 32,
    checklist = false,
  ) {
    for (let row = 0; row < rows; row++) {
      const baseline = y + row * spacing;
      if (checklist) box(x, baseline - 14, 12, 12);
      line(x + (checklist ? 24 : 0), baseline, x + width);
    }
  }

  function section(title: string, x: number, y: number) {
    text(title, x, y, 14, colors.accent);
  }

  text("MEU PLANNER", 48, 56, 12, colors.muted);
  text(
    template === "daily"
      ? "Um dia de cada vez"
      : template === "weekly"
        ? "Minha semana"
        : "Meu mês",
    48,
    102,
    34,
  );
  text(
    template === "daily"
      ? "DATA"
      : template === "weekly"
        ? "SEMANA DE"
        : "MÊS / ANO",
    48,
    146,
    12,
    colors.muted,
  );
  line(template === "weekly" ? 130 : 120, 149, 330);
  line(48, 174, 672);

  switch (template) {
    case "daily": {
      section("FOCO DO DIA", 48, 210);
      box(48, 226, 624, 58, true);
      section("MINHAS PRIORIDADES", 48, 326);
      ruled(48, 366, 624, 3, 36, true);
      section("HORÁRIOS", 48, 496);
      section("TAREFAS", 396, 496);
      for (let hour = 0; hour < 12; hour++) {
        const y = 535 + hour * 28;
        text(
          `${String(hour + 7).padStart(2, "0")}:00`,
          48,
          y - 6,
          12,
          colors.muted,
        );
        line(100, y, 360);
      }
      ruled(396, 535, 276, 12, 28, true);
      section("NOTAS & IDEIAS", 48, 896);
      ruled(48, 934, 624, 2, 32);
      break;
    }
    case "weekly": {
      section("FOCO DA SEMANA", 48, 210);
      box(48, 226, 624, 58, true);
      for (let day = 0; day < 7; day++) {
        const x = 48 + (day % 2) * 324;
        const y = 310 + Math.floor(day / 2) * 154;
        box(x, y, 300, 138);
        section(WEEKDAYS[day], x + 16, y + 27);
        line(x + 218, y + 30, x + 284);
        ruled(x + 16, y + 64, 268, 3, 28);
      }
      box(372, 772, 300, 138, true);
      section("PARA A PRÓXIMA SEMANA", 388, 799);
      ruled(388, 836, 268, 2, 28);
      section("ANOTAÇÕES", 48, 946);
      line(48, 970, 672);
      break;
    }
    case "monthly": {
      section("VISÃO DO MÊS", 48, 210);
      const cellWidth = 624 / 7;
      const gridY = 262;
      box(48, 230, 624, 32, true);
      for (let day = 0; day < 7; day++) {
        text(
          ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"][day],
          48 + day * cellWidth + 14,
          251,
          12,
          colors.accent,
        );
      }
      box(48, gridY, 624, 528);
      for (let column = 1; column < 7; column++) {
        line(
          48 + column * cellWidth,
          gridY,
          48 + column * cellWidth,
          gridY + 528,
        );
      }
      for (let row = 0; row < 6; row++) {
        if (row > 0) line(48, gridY + row * 88, 672);
        for (let column = 0; column < 7; column++) {
          box(58 + column * cellWidth, gridY + row * 88 + 10, 20, 18);
        }
      }
      section("METAS DO MÊS", 48, 834);
      section("LEMBRETES", 372, 834);
      ruled(48, 876, 300, 4, 30, true);
      ruled(372, 876, 300, 4, 30);
      break;
    }
  }

  return recorder.finishRecordingAsPicture();
}
