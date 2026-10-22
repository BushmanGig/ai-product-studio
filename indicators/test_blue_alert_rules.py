"""State-machine checks for the published Blue Alert grading and HTF rules."""

from __future__ import annotations

import unittest

from blue_alert_rules import Engine, Rules

ENABLED = {"A++", "A+", "B++", "B+"}
A_ONLY = {"A++", "A+"}


def bar(engine: Engine, index: int, close: float, **kwargs):
    defaults = dict(
        ema_cross=False,
        buy_setup=False,
        sell_setup=False,
        bull_structure=False,
        bear_structure=False,
        htf_buy_edge=False,
        htf_sell_edge=False,
        htf_price=None,
        htf_ema_bull=None,
        enabled=ENABLED,
    )
    defaults.update(kwargs)
    return engine.on_bar(index, close, **defaults)


class GradeTests(unittest.TestCase):
    def test_first_pullback_is_a_plus_until_structure_breaks(self) -> None:
        engine = Engine()
        first = bar(engine, 0, 100, ema_cross=True, buy_setup=True, bull_structure=False)
        self.assertEqual((first.grade, first.direction, first.blue), ("A+", "BUY", False))

    def test_structure_break_upgrades_the_same_pullback_slot(self) -> None:
        engine = Engine()
        graded = bar(engine, 3, 110, buy_setup=True, bull_structure=True)
        self.assertEqual(graded.grade, "A++")

    def test_second_pullback_is_b_and_third_is_dropped(self) -> None:
        engine = Engine()
        bar(engine, 1, 100, buy_setup=True)
        second = bar(engine, 2, 101, buy_setup=True, bull_structure=True)
        third = bar(engine, 3, 102, buy_setup=True, bull_structure=True)
        self.assertEqual(second.grade, "B++")
        self.assertIsNone(third.grade)
        self.assertEqual(third.bull_count, 3)

    def test_later_pullbacks_stay_b_only_when_explicitly_enabled(self) -> None:
        engine = Engine(Rules(allow_later_pullbacks=True))
        bar(engine, 1, 100, buy_setup=True)
        bar(engine, 2, 101, buy_setup=True)
        third = bar(engine, 3, 102, buy_setup=True, bull_structure=False)
        self.assertEqual(third.grade, "B+")

    def test_ema_cross_resets_the_wave_so_the_next_setup_is_a(self) -> None:
        engine = Engine()
        bar(engine, 1, 100, buy_setup=True)
        bar(engine, 2, 101, buy_setup=True)
        reset = bar(engine, 3, 90, ema_cross=True, sell_setup=True, bear_structure=True)
        self.assertEqual(reset.grade, "A++")
        self.assertEqual(reset.direction, "SELL")
        self.assertEqual((reset.bull_count, reset.bear_count), (0, 1))

    def test_hidden_first_pullback_still_consumes_the_a_slot(self) -> None:
        engine = Engine()
        hidden = bar(engine, 1, 100, buy_setup=True, bull_structure=False, enabled={"A++", "B++"})
        shown = bar(engine, 2, 105, buy_setup=True, bull_structure=True, enabled={"A++", "B++"})
        self.assertIsNone(hidden.grade)
        self.assertEqual(hidden.bull_count, 1)
        self.assertEqual(shown.grade, "B++")

    def test_sell_mirror_uses_lower_low_structure(self) -> None:
        engine = Engine()
        graded = bar(engine, 4, 80, sell_setup=True, bear_structure=False)
        self.assertEqual((graded.grade, graded.direction), ("A+", "SELL"))


class HigherTimeframeTests(unittest.TestCase):
    def test_one_htf_signal_produces_one_blue_alert(self) -> None:
        engine = Engine()
        armed = bar(engine, 10, 100, htf_buy_edge=True, htf_price=99.0)
        self.assertEqual((armed.htf_dir, armed.htf_level, armed.blue), (1, 99.0, False))
        blue = bar(engine, 14, 101, buy_setup=True, bull_structure=True)
        classic = bar(engine, 18, 103, buy_setup=True, bull_structure=True)
        self.assertTrue(blue.blue)
        self.assertEqual(blue.grade, "A++")
        self.assertFalse(classic.blue)
        self.assertEqual(classic.grade, "B++")
        self.assertEqual(classic.htf_dir, 0)

    def test_same_bar_htf_signal_does_not_paint_the_current_setup_blue(self) -> None:
        engine = Engine()
        result = bar(
            engine,
            5,
            100,
            buy_setup=True,
            bull_structure=True,
            htf_buy_edge=True,
            htf_price=100.0,
        )
        self.assertEqual(result.grade, "A++")
        self.assertFalse(result.blue)
        self.assertEqual(result.htf_dir, 1)

    def test_breaking_the_htf_level_cancels_before_the_next_setup(self) -> None:
        engine = Engine()
        bar(engine, 10, 100, htf_buy_edge=True, htf_price=99.0)
        cancelled = bar(engine, 11, 98.5)
        self.assertEqual(cancelled.htf_dir, 0)
        classic = bar(engine, 12, 101, buy_setup=True)
        self.assertEqual(classic.grade, "A+")
        self.assertFalse(classic.blue)

    def test_holding_the_level_keeps_the_long_armed(self) -> None:
        engine = Engine()
        bar(engine, 10, 100, htf_buy_edge=True, htf_price=99.0)
        held = bar(engine, 11, 99.0)
        self.assertEqual(held.htf_dir, 1)

    def test_sell_level_is_the_mirror_and_double_uses_bar_distance(self) -> None:
        engine = Engine(Rules(double_alert_bars=5))
        bar(engine, 20, 100, htf_sell_edge=True, htf_price=101.0)
        early = bar(engine, 24, 100, sell_setup=True, bear_structure=True)
        self.assertTrue(early.blue)
        self.assertTrue(early.double)
        bar(engine, 30, 100, htf_sell_edge=True, htf_price=102.0)
        late = bar(engine, 40, 99, sell_setup=True, bear_structure=False)
        self.assertTrue(late.blue)
        self.assertFalse(late.double)

    def test_price_through_a_sell_level_cancels_it(self) -> None:
        engine = Engine()
        bar(engine, 2, 100, htf_sell_edge=True, htf_price=101.0)
        cancelled = bar(engine, 3, 101.5)
        self.assertEqual(cancelled.htf_dir, 0)

    def test_new_htf_signal_rearms_after_the_previous_blue_was_used(self) -> None:
        engine = Engine()
        bar(engine, 1, 100, htf_buy_edge=True, htf_price=90.0)
        bar(engine, 2, 100, buy_setup=True)
        rearmed = bar(engine, 3, 100, htf_buy_edge=True, htf_price=95.0)
        self.assertEqual((rearmed.htf_dir, rearmed.htf_level), (1, 95.0))
        nxt = bar(engine, 4, 96, buy_setup=True)
        self.assertTrue(nxt.blue)

    def test_ema_mode_filters_direction_and_does_not_consume_a_level(self) -> None:
        engine = Engine(Rules(mode="ema"))
        first = bar(engine, 1, 100, buy_setup=True, htf_ema_bull=True)
        second = bar(engine, 2, 101, buy_setup=True, bull_structure=True, htf_ema_bull=True)
        blocked = bar(engine, 3, 90, ema_cross=True, sell_setup=True, htf_ema_bull=True)
        self.assertTrue(first.blue)
        self.assertTrue(second.blue)
        self.assertEqual(blocked.grade, "A+")
        self.assertFalse(blocked.blue)
        self.assertEqual(blocked.htf_dir, 0)


if __name__ == "__main__":
    unittest.main()
