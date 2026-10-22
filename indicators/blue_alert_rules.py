"""Decision rules for the Blue Alert study.

These mirror the chart-side state machine in
``mogwai_blue_alerts_indicator.pine``. Higher-timeframe events passed in
here are already closed-bar events: Pine publishes them with a one-bar
``request.security`` offset so a forming higher-timeframe bar cannot repaint.

This is an independent study of publicly described behaviour. It is not the
FX Learning / Mogwai invite-only source.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field


@dataclass
class Rules:
    allow_later_pullbacks: bool = False
    double_alert_bars: int = 10
    # "level" is the published Blue Alert engine.
    # "ema" is the separate Renko-style higher-timeframe EMA filter.
    mode: str = "level"


def relative_angle(delta: float, atr: float, lookback: int) -> float:
    """ATR-relative slope of a moving average, in degrees.

    ``delta / (atr * lookback)`` keeps the angle comparable across price
    scales. A result near zero is a flat average: the cold, blurry range.
    """
    if lookback <= 0:
        raise ValueError("lookback must be positive")
    denom = atr * lookback
    if denom == 0:
        return 0.0
    return math.atan(delta / denom) * 180.0 / math.pi


def ema_bias(angle: float, flat_degrees: float) -> str:
    if flat_degrees < 0:
        raise ValueError("flat band must be >= 0")
    if abs(angle) < flat_degrees:
        return "FLAT"
    return "BULL" if angle > 0 else "BEAR"


def resolve_outcome(
    direction: int, stop: float, target: float, low: float, high: float
) -> str | None:
    """Resolve a stored stop and target. A bar that hits both is a loss."""
    if direction == 1:
        if low <= stop:
            return "LOSS"
        if high >= target:
            return "WIN"
    elif direction == -1:
        if high >= stop:
            return "LOSS"
        if low <= target:
            return "WIN"
    else:
        raise ValueError("direction must be 1 or -1")
    return None


@dataclass
class BarResult:
    grade: str | None = None
    direction: str | None = None
    blue: bool = False
    double: bool = False
    htf_dir: int = 0
    htf_level: float | None = None
    bull_count: int = 0
    bear_count: int = 0


@dataclass
class Engine:
    rules: Rules = field(default_factory=Rules)
    bull_count: int = 0
    bear_count: int = 0
    htf_dir: int = 0
    htf_level: float | None = None
    htf_bar: int | None = None

    def on_bar(
        self,
        index: int,
        close: float,
        *,
        ema_cross: bool,
        buy_setup: bool,
        sell_setup: bool,
        bull_structure: bool,
        bear_structure: bool,
        htf_buy_edge: bool,
        htf_sell_edge: bool,
        htf_price: float | None,
        htf_ema_bull: bool | None,
        enabled: set[str],
        cold: bool = False,
    ) -> BarResult:
        if self.rules.mode not in ("level", "ema"):
            raise ValueError(f"unknown mode: {self.rules.mode}")
        if cold:
            buy_setup = False
            sell_setup = False
        if buy_setup and sell_setup:
            raise ValueError("buy and sell setups are mutually exclusive")

        if ema_cross:
            self.bull_count = 0
            self.bear_count = 0

        grade: str | None = None
        direction: str | None = None
        if buy_setup:
            self.bull_count += 1
            if self.rules.allow_later_pullbacks or self.bull_count <= 2:
                letter = "A" if self.bull_count == 1 else "B"
                grade = letter + ("++" if bull_structure else "+")
                direction = "BUY"
        elif sell_setup:
            self.bear_count += 1
            if self.rules.allow_later_pullbacks or self.bear_count <= 2:
                letter = "A" if self.bear_count == 1 else "B"
                grade = letter + ("++" if bear_structure else "+")
                direction = "SELL"

        if grade is not None and grade not in enabled:
            grade = None
            direction = None

        blue = False
        double = False
        if grade is not None and direction is not None:
            if self.rules.mode == "ema":
                if htf_ema_bull is None:
                    raise ValueError("ema mode requires htf_ema_bull")
                blue = (direction == "BUY" and htf_ema_bull) or (
                    direction == "SELL" and not htf_ema_bull
                )
            elif direction == "BUY" and self.htf_dir == 1 and self.htf_level is not None:
                blue = close >= self.htf_level
            elif direction == "SELL" and self.htf_dir == -1 and self.htf_level is not None:
                blue = close <= self.htf_level

            if blue and self.rules.mode == "level" and self.htf_bar is not None:
                double = (index - self.htf_bar) <= self.rules.double_alert_bars
                self.htf_dir = 0

        if self.rules.mode == "level":
            if self.htf_dir == 1 and self.htf_level is not None and close < self.htf_level:
                self.htf_dir = 0
            if self.htf_dir == -1 and self.htf_level is not None and close > self.htf_level:
                self.htf_dir = 0
            if htf_buy_edge:
                if htf_price is None:
                    raise ValueError("htf buy edge requires a price")
                self.htf_dir = 1
                self.htf_level = htf_price
                self.htf_bar = index
            elif htf_sell_edge:
                if htf_price is None:
                    raise ValueError("htf sell edge requires a price")
                self.htf_dir = -1
                self.htf_level = htf_price
                self.htf_bar = index

        return BarResult(
            grade=grade,
            direction=direction,
            blue=blue,
            double=double,
            htf_dir=self.htf_dir,
            htf_level=self.htf_level,
            bull_count=self.bull_count,
            bear_count=self.bear_count,
        )
